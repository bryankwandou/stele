//! Stele — catatan on-chain atas praktik membaca teks suci.
//!
//! Program ini sengaja tidak memutuskan apakah seseorang "benar-benar membaca".
//! Itu dinilai di luar rantai oleh heuristik server. Yang dijamin program ini
//! adalah hal-hal yang memang bisa dijamin oleh rantai:
//!
//!   1. Sebuah klaim hanya sah jika ditandatangani attestor yang terdaftar.
//!   2. Satu attestation hanya bisa dipakai sekali (nonce PDA).
//!   3. Batas harian ditegakkan, bahkan bila server disusupi.
//!   4. Besar hadiah dibatasi plafon on-chain, bukan oleh server.
//!
//! Poin 3 dan 4 penting: keduanya membatasi kerusakan bila kunci attestor bocor.
//! Penyerang yang menguasai kunci server tetap tidak bisa mencetak suplai tanpa
//! batas — ia hanya bisa mengklaim sebanyak pembaca paling rajin.

use anchor_lang::prelude::*;
use solana_instructions_sysvar as ix_sysvar;

/// Alamat program bawaan ditulis eksplisit.
///
/// Anchor 1.0 memindahkan konstanta ini beberapa kali antar crate. Menuliskannya
/// langsung membuat program tidak ikut rusak setiap kali tata letak crate berubah,
/// dan pembaca kode bisa memverifikasinya tanpa menelusuri dependensi.
const ED25519_PROGRAM_ID: Pubkey =
    Pubkey::from_str_const("Ed25519SigVerify111111111111111111111111111");
const INSTRUCTIONS_SYSVAR_ID: Pubkey =
    Pubkey::from_str_const("Sysvar1nstructions1111111111111111111111111");
use anchor_spl::token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface};

declare_id!("B7iJ9rGP5jPFx3XmWPPAxgvxrv2SvVLRuKNq16iUJWKK");

/// Pesan attestation berukuran tetap 64 byte agar bisa diparse tanpa alokasi.
/// tata letak: wallet(32) ‖ nonce(16) ‖ amount_le(8) ‖ expiry_le(8)
pub const ATTESTATION_LEN: usize = 64;

/// Tata letak instruksi Ed25519SigVerify bawaan Solana untuk satu tanda tangan.
const ED25519_HEADER_LEN: usize = 16;
const ED25519_PUBKEY_OFFSET: usize = ED25519_HEADER_LEN;
const ED25519_SIGNATURE_OFFSET: usize = ED25519_PUBKEY_OFFSET + 32;
const ED25519_MESSAGE_OFFSET: usize = ED25519_SIGNATURE_OFFSET + 64;
const ED25519_EXPECTED_LEN: usize = ED25519_MESSAGE_OFFSET + ATTESTATION_LEN;

pub const SECONDS_PER_DAY: i64 = 86_400;

#[program]
pub mod stele_onchain {
    use super::*;

    /// Sekali jalan. Mengunci attestor, plafon harian, dan plafon hadiah.
    pub fn initialize(
        ctx: Context<Initialize>,
        attestor: Pubkey,
        daily_cap: u8,
        max_reward: u64,
    ) -> Result<()> {
        require!(daily_cap > 0 && daily_cap <= 10, SteleError::CapOutOfRange);
        require!(max_reward > 0, SteleError::RewardOutOfRange);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.attestor = attestor;
        config.mint = ctx.accounts.mint.key();
        config.daily_cap = daily_cap;
        config.max_reward = max_reward;
        config.total_passages = 0;
        config.bump = ctx.bumps.config;

        Ok(())
    }

    /// Mendaftarkan pembaca. Offset zona waktu dikunci di sini supaya beruntun
    /// tidak bisa diperpanjang dengan berpindah-pindah zona waktu.
    pub fn register_reader(ctx: Context<RegisterReader>, tz_offset_minutes: i16) -> Result<()> {
        require!(
            (-840..=840).contains(&tz_offset_minutes),
            SteleError::InvalidTimezone
        );

        let reader = &mut ctx.accounts.reader;
        reader.owner = ctx.accounts.owner.key();
        reader.tz_offset_minutes = tz_offset_minutes;
        reader.streak_current = 0;
        reader.streak_best = 0;
        reader.last_day = i64::MIN;
        reader.passages_today = 0;
        reader.total_passages = 0;
        reader.bump = ctx.bumps.reader;

        Ok(())
    }

    /// Menukar satu attestation server menjadi catatan on-chain + token.
    ///
    /// Klien wajib menempatkan instruksi Ed25519SigVerify tepat sebelum
    /// instruksi ini di dalam transaksi yang sama.
    pub fn claim(ctx: Context<Claim>, nonce: [u8; 16], amount: u64, expiry: i64) -> Result<()> {
        let clock = Clock::get()?;

        {
            let config = &ctx.accounts.config;
            require!(
                clock.unix_timestamp <= expiry,
                SteleError::AttestationExpired
            );
            require!(amount > 0, SteleError::RewardOutOfRange);
            require!(amount <= config.max_reward, SteleError::RewardOutOfRange);

            // Verifikasi bahwa attestor benar-benar menandatangani klaim ini.
            let expected = build_message(&ctx.accounts.owner.key(), &nonce, amount, expiry);
            verify_ed25519(&ctx.accounts.instructions, &config.attestor, &expected)?;
        }

        let daily_cap = ctx.accounts.config.daily_cap;
        let config_bump = ctx.accounts.config.bump;

        // --- Beruntun & plafon harian ---
        let (streak_now, today) = {
            let reader = &mut ctx.accounts.reader;
            let today = local_day(clock.unix_timestamp, reader.tz_offset_minutes);

            if today != reader.last_day {
                // Hari baru. Beruntun berlanjut hanya bila hari terakhir persis kemarin.
                reader.streak_current = if reader.last_day == today - 1 {
                    reader.streak_current.saturating_add(1)
                } else {
                    1
                };
                reader.streak_best = reader.streak_best.max(reader.streak_current);
                reader.last_day = today;
                reader.passages_today = 0;
            }

            require!(
                reader.passages_today < daily_cap,
                SteleError::DailyCapReached
            );

            reader.passages_today = reader.passages_today.saturating_add(1);
            reader.total_passages = reader.total_passages.saturating_add(1);

            (reader.streak_current, today)
        };

        // --- Tandai nonce terpakai ---
        // Akun ini di-init di sini; bila attestation yang sama dikirim ulang,
        // init gagal dan transaksi ditolak. Itulah perlindungan replay-nya.
        let reader_key = ctx.accounts.reader.key();
        let record = &mut ctx.accounts.nonce_record;
        record.nonce = nonce;
        record.reader = reader_key;
        record.claimed_at = clock.unix_timestamp;
        record.bump = ctx.bumps.nonce_record;

        // --- Cetak token ---
        let signer_seeds: &[&[&[u8]]] = &[&[b"config", &[config_bump]]];
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.reader_tokens.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        let config = &mut ctx.accounts.config;
        config.total_passages = config.total_passages.saturating_add(1);

        emit!(PassageRecorded {
            reader: ctx.accounts.owner.key(),
            day: today,
            streak: streak_now,
            amount,
        });

        Ok(())
    }

    /// Mengganti kunci attestor tanpa deploy ulang — jalur pemulihan bila kunci
    /// server bocor.
    pub fn rotate_attestor(ctx: Context<RotateAttestor>, new_attestor: Pubkey) -> Result<()> {
        ctx.accounts.config.attestor = new_attestor;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Pembantu
// ---------------------------------------------------------------------------

fn build_message(
    owner: &Pubkey,
    nonce: &[u8; 16],
    amount: u64,
    expiry: i64,
) -> [u8; ATTESTATION_LEN] {
    let mut msg = [0u8; ATTESTATION_LEN];
    msg[0..32].copy_from_slice(owner.as_ref());
    msg[32..48].copy_from_slice(nonce);
    msg[48..56].copy_from_slice(&amount.to_le_bytes());
    msg[56..64].copy_from_slice(&expiry.to_le_bytes());
    msg
}

/// Hari kalender lokal pembaca, dibulatkan ke bawah.
/// Pembagian Rust memotong ke arah nol, jadi timestamp negatif ditangani manual.
fn local_day(unix_ts: i64, tz_offset_minutes: i16) -> i64 {
    let shifted = unix_ts + (tz_offset_minutes as i64) * 60;
    if shifted >= 0 {
        shifted / SECONDS_PER_DAY
    } else {
        (shifted - (SECONDS_PER_DAY - 1)) / SECONDS_PER_DAY
    }
}

/// Membaca instruksi tepat sebelum instruksi berjalan dan memastikan itu adalah
/// Ed25519SigVerify yang menandatangani `expected_message` dengan `expected_signer`.
///
/// Introspeksi ini wajib. Program Ed25519 hanya membuktikan "ada tanda tangan
/// valid di transaksi ini" — tanpa memeriksa isinya, penyerang bisa melampirkan
/// tanda tangan sah atas pesan yang sama sekali lain.
fn verify_ed25519(
    instructions: &AccountInfo,
    expected_signer: &Pubkey,
    expected_message: &[u8; ATTESTATION_LEN],
) -> Result<()> {
    let current = ix_sysvar::load_current_index_checked(instructions)?;
    require!(current > 0, SteleError::MissingSignature);

    let sig_ix = ix_sysvar::load_instruction_at_checked((current - 1) as usize, instructions)?;

    require_keys_eq!(
        sig_ix.program_id,
        ED25519_PROGRAM_ID,
        SteleError::MissingSignature
    );
    require!(
        sig_ix.data.len() == ED25519_EXPECTED_LEN,
        SteleError::MalformedSignature
    );
    // Tepat satu tanda tangan, dengan tata letak offset baku.
    require!(sig_ix.data[0] == 1, SteleError::MalformedSignature);

    let signer = &sig_ix.data[ED25519_PUBKEY_OFFSET..ED25519_PUBKEY_OFFSET + 32];
    require!(
        signer == expected_signer.as_ref(),
        SteleError::UnknownAttestor
    );

    let message = &sig_ix.data[ED25519_MESSAGE_OFFSET..ED25519_MESSAGE_OFFSET + ATTESTATION_LEN];
    require!(
        message == expected_message.as_slice(),
        SteleError::AttestationMismatch
    );

    Ok(())
}

// ---------------------------------------------------------------------------
// Akun
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub attestor: Pubkey,
    pub mint: Pubkey,
    pub daily_cap: u8,
    pub max_reward: u64,
    pub total_passages: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Reader {
    pub owner: Pubkey,
    pub tz_offset_minutes: i16,
    pub streak_current: u32,
    pub streak_best: u32,
    pub last_day: i64,
    pub passages_today: u8,
    pub total_passages: u64,
    pub bump: u8,
}

/// Akun penanda. Keberadaannya sendiri sudah cukup — isinya hanya untuk audit.
#[account]
#[derive(InitSpace)]
pub struct NonceRecord {
    pub nonce: [u8; 16],
    pub reader: Pubkey,
    pub claimed_at: i64,
    pub bump: u8,
}

#[event]
pub struct PassageRecorded {
    pub reader: Pubkey,
    pub day: i64,
    pub streak: u32,
    pub amount: u64,
}

// ---------------------------------------------------------------------------
// Konteks
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    /// Otoritas cetak harus sudah dipindahkan ke PDA config sebelum ini dipanggil.
    #[account(mint::authority = config)]
    pub mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReader<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Reader::INIT_SPACE,
        seeds = [b"reader", owner.key().as_ref()],
        bump
    )]
    pub reader: Account<'info, Reader>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nonce: [u8; 16])]
pub struct Claim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"reader", owner.key().as_ref()],
        bump = reader.bump,
        has_one = owner
    )]
    pub reader: Account<'info, Reader>,

    #[account(
        init,
        payer = owner,
        space = 8 + NonceRecord::INIT_SPACE,
        seeds = [b"nonce", nonce.as_ref()],
        bump
    )]
    pub nonce_record: Account<'info, NonceRecord>,

    #[account(mut, address = config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = owner
    )]
    pub reader_tokens: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: divalidasi sebagai sysvar instruksi lewat alamatnya.
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RotateAttestor<'info> {
    pub authority: Signer<'info>,

    #[account(mut, seeds = [b"config"], bump = config.bump, has_one = authority)]
    pub config: Account<'info, Config>,
}

// ---------------------------------------------------------------------------
// Kesalahan
// ---------------------------------------------------------------------------

#[error_code]
pub enum SteleError {
    #[msg("Plafon harian harus antara 1 dan 10.")]
    CapOutOfRange,
    #[msg("Besar hadiah nol atau melampaui plafon on-chain.")]
    RewardOutOfRange,
    #[msg("Offset zona waktu di luar rentang yang wajar.")]
    InvalidTimezone,
    #[msg("Attestation sudah kedaluwarsa.")]
    AttestationExpired,
    #[msg("Instruksi Ed25519SigVerify tidak ditemukan sebelum instruksi ini.")]
    MissingSignature,
    #[msg("Instruksi Ed25519 tidak memakai tata letak satu tanda tangan yang diharapkan.")]
    MalformedSignature,
    #[msg("Penanda tangan bukan attestor terdaftar.")]
    UnknownAttestor,
    #[msg("Pesan yang ditandatangani tidak cocok dengan klaim ini.")]
    AttestationMismatch,
    #[msg("Plafon bacaan harian sudah tercapai. Kembali besok.")]
    DailyCapReached,
}
