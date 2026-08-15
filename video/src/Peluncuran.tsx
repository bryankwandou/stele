import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Angka, Judul, Kening, Latar, Lempeng, Naik, Tolakan, Tubuh } from "./bagian";
import { ADEGAN, HURUF, WARNA } from "./teater";

/**
 * Video peluncuran, 35 detik.
 *
 * Urutannya mengikuti urutan argumen di pitch, bukan urutan fitur: masalahnya
 * dulu, lalu pembalikannya, baru alasan teknisnya. Fitur disebut hanya bila ia
 * membuktikan salah satu dari ketiganya.
 */

/** Peralihan lembut antar adegan supaya potongannya tidak terasa dipotong. */
const Adegan: React.FC<{ panjang: number; children: React.ReactNode }> = ({
  panjang,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, panjang - 12, panjang],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const Pembuka: React.FC = () => (
  <Adegan panjang={ADEGAN.pembuka}>
    <Latar>
      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <div>
          <Kening>Solana devnet</Kening>
          <Judul ukuran={82}>
            Bacaan Anda meninggalkan catatan yang tidak bisa dihapus siapa pun.
          </Judul>
        </div>
        <Naik mulai={14}>
          <Lempeng mulai={22} skala={1.15} />
        </Naik>
      </div>
    </Latar>
  </Adegan>
);

const Masalah: React.FC = () => (
  <Adegan panjang={ADEGAN.masalah}>
    <Latar>
      <Kening>Yang selalu terjadi</Kening>
      <Judul>
        Aplikasi yang membayar orang membaca akan mengundang skrip, bukan pembaca.
      </Judul>
      <Tubuh mulai={16}>
        Sudah pernah ada yang mencoba dengan satoshi. Aplikasi itu mati. Begitu ada
        harga per ayat, yang datang adalah orang yang menghitung keuntungan per jam.
      </Tubuh>
    </Latar>
  </Adegan>
);

const Balik: React.FC = () => (
  <Adegan panjang={ADEGAN.balik}>
    <Latar>
      <Kening>Pembalikannya</Kening>
      <Judul ukuran={72}>Token di sini bukan upah. Ia tanda terima.</Judul>
      <Tubuh mulai={18}>
        Program yang memalsukan sepuluh ribu sesi hanya menghasilkan sepuluh ribu
        catatan kosong tentang dirinya sendiri. Tidak ada yang bisa dijual.
      </Tubuh>
    </Latar>
  </Adegan>
);

const Rantai: React.FC = () => (
  <Adegan panjang={ADEGAN.rantai}>
    <Latar>
      <Kening>Kenapa harus di rantai</Kening>
      <Judul ukuran={70}>
        Bukan supaya Anda tidak perlu percaya negara. Supaya Anda tidak perlu
        percaya kami.
      </Judul>
      <Tubuh mulai={20}>
        Catatan hanya lahir dari pernyataan 64 byte yang ditandatangani kunci
        penilai, lalu diperiksa program on-chain. Kami tidak punya jalan untuk
        menerbitkan catatan yang tidak lolos penilaian kami sendiri.
      </Tubuh>
    </Latar>
  </Adegan>
);

const Bukti: React.FC = () => (
  <Adegan panjang={ADEGAN.bukti}>
    <Latar>
      <Kening>Bukan didemokan — diserang</Kening>
      <Judul ukuran={58}>
        Tujuh cara memalsukan catatan, dan apa yang program jawab.
      </Judul>
      <Tolakan
        mulai={22}
        baris={[
          { serangan: "Attestation yang sama dipakai ulang", galat: "nonce sudah terpakai" },
          { serangan: "Ditandatangani kunci sendiri", galat: "UnknownAttestor" },
          { serangan: "Jumlah dinaikkan diam-diam", galat: "AttestationMismatch" },
          { serangan: "Jumlah dinaikkan lewat plafon", galat: "RewardOutOfRange" },
          { serangan: "Attestation yang sudah kedaluwarsa", galat: "AttestationExpired" },
          { serangan: "Attestation milik dompet lain", galat: "AttestationMismatch" },
          { serangan: "Klaim keempat pada hari yang sama", galat: "DailyCapReached" },
        ]}
      />
    </Latar>
  </Adegan>
);

const Cakupan: React.FC = () => {
  const angka = [
    { n: 1781, l: "terjemahan" },
    { n: 1074, l: "bahasa" },
    { n: 3, l: "tradisi" },
  ];

  return (
    <Adegan panjang={ADEGAN.cakupan}>
      <Latar>
        <Kening>Satu antarmuka di atas tiga arsip</Kening>
        <div style={{ display: "flex", gap: 130, marginTop: 20 }}>
          {angka.map((a, i) => (
            <Naik key={a.l} mulai={10 + i * 7}>
              <div
                style={{
                  fontFamily: HURUF.ukir,
                  fontSize: 108,
                  lineHeight: 1,
                  color: WARNA.patina,
                }}
              >
                <Angka nilai={a.n} mulai={14 + i * 7} />
              </div>
              <div style={{ fontSize: 27, color: WARNA.tintaLembut, marginTop: 18 }}>
                {a.l}
              </div>
            </Naik>
          ))}
        </div>
        <Tubuh mulai={34}>
          Tidak ada satu ayat pun tersimpan di basis data kami. Setiap perikop
          diambil saat dibuka, lengkap dengan kreditnya.
        </Tubuh>
      </Latar>
    </Adegan>
  );
};

const Plafon: React.FC = () => (
  <Adegan panjang={ADEGAN.plafon}>
    <Latar>
      <Kening>Pertahanan yang sebenarnya bekerja</Kening>
      <Judul ukuran={70}>
        Pembaca paling gigih dan penyerang paling gigih mendapat jumlah yang persis
        sama.
      </Judul>
      <Tubuh mulai={18}>
        Tiga bacaan tercatat per hari, ditegakkan di server dan di program.
        Farming tidak punya skala untuk dikejar.
      </Tubuh>
    </Latar>
  </Adegan>
);

const Penutup: React.FC = () => (
  <Adegan panjang={ADEGAN.penutup}>
    <Latar>
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <Naik>
          <Lempeng mulai={6} skala={0.62} />
        </Naik>
        <div>
          <Naik mulai={8}>
            <div style={{ fontFamily: HURUF.ukir, fontSize: 104, fontWeight: 600 }}>
              Stele
            </div>
          </Naik>
          <Naik mulai={18}>
            <div style={{ fontSize: 30, color: WARNA.tintaLembut, marginTop: 16 }}>
              stele-gamma.vercel.app
            </div>
          </Naik>
        </div>
      </div>
    </Latar>
  </Adegan>
);

export const Peluncuran: React.FC = () => {
  let dari = 0;
  const urut: [keyof typeof ADEGAN, React.FC][] = [
    ["pembuka", Pembuka],
    ["masalah", Masalah],
    ["balik", Balik],
    ["rantai", Rantai],
    ["bukti", Bukti],
    ["cakupan", Cakupan],
    ["plafon", Plafon],
    ["penutup", Penutup],
  ];

  return (
    <AbsoluteFill style={{ background: WARNA.batu2 }}>
      {urut.map(([nama, Komponen]) => {
        const mulai = dari;
        dari += ADEGAN[nama];
        return (
          <Sequence key={nama} from={mulai} durationInFrames={ADEGAN[nama]}>
            <Komponen />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
