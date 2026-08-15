import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HURUF, WARNA } from "./teater";

/**
 * Potongan yang dipakai berulang di beberapa adegan.
 *
 * Semua gerakan di sini kecil dan lambat. Materinya batu; video yang isinya
 * meluncur dan memantul akan bertengkar dengan pokoknya sendiri.
 */

/** Naik pelan sambil muncul. Dipakai untuk hampir semua teks. */
export const Naik: React.FC<{
  mulai?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ mulai = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = spring({
    frame: frame - mulai,
    fps,
    config: { damping: 200, mass: 0.7 },
  });

  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Latar batu dengan cahaya dari kiri atas, sama seperti lambangnya. */
export const Latar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 140px",
      background: `radial-gradient(120% 100% at 18% 8%, ${WARNA.batu1} 0%, ${WARNA.batu2} 55%, ${WARNA.batu3} 100%)`,
      fontFamily: HURUF.badan,
      color: WARNA.tinta,
    }}
  >
    {children}
  </div>
);

export const Kening: React.FC<{ children: React.ReactNode; mulai?: number }> = ({
  children,
  mulai = 0,
}) => (
  <Naik mulai={mulai}>
    <div
      style={{
        fontSize: 22,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: WARNA.tintaLembut,
        marginBottom: 34,
      }}
    >
      {children}
    </div>
  </Naik>
);

export const Judul: React.FC<{
  children: React.ReactNode;
  mulai?: number;
  ukuran?: number;
}> = ({ children, mulai = 0, ukuran = 76 }) => (
  <Naik mulai={mulai}>
    <div
      style={{
        fontFamily: HURUF.ukir,
        fontSize: ukuran,
        lineHeight: 1.14,
        fontWeight: 600,
        maxWidth: 1180,
        letterSpacing: "-0.005em",
      }}
    >
      {children}
    </div>
  </Naik>
);

export const Tubuh: React.FC<{ children: React.ReactNode; mulai?: number }> = ({
  children,
  mulai = 0,
}) => (
  <Naik mulai={mulai}>
    <div
      style={{
        fontSize: 30,
        lineHeight: 1.6,
        color: WARNA.tintaLembut,
        maxWidth: 980,
        marginTop: 30,
      }}
    >
      {children}
    </div>
  </Naik>
);

/**
 * Lempeng yang dipahat baris demi baris — bentuk yang sama dengan lambangnya.
 * Baris terakhir berwarna tanah dan sengaja berhenti di tengah.
 */
export const Lempeng: React.FC<{ mulai?: number; skala?: number }> = ({
  mulai = 0,
  skala = 1,
}) => {
  const frame = useCurrentFrame();
  const baris = [62, 88, 114, 140, 166, 192];
  const panjang = 108;

  const potong = (i: number) => {
    const t = interpolate(frame - mulai, [i * 9, i * 9 + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { strokeDasharray: panjang, strokeDashoffset: panjang * (1 - t) };
  };

  const hariIni = () => {
    const t = interpolate(frame - mulai, [baris.length * 9, baris.length * 9 + 22], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { strokeDasharray: 54, strokeDashoffset: 54 * (1 - t) };
  };

  return (
    <svg
      viewBox="0 0 232 268"
      width={232 * skala}
      height={268 * skala}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="vbatu" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#F2ECDF" />
          <stop offset="0.52" stopColor="#DFD3BC" />
          <stop offset="1" stopColor="#C2B49A" />
        </linearGradient>
        <clipPath id="vslab">
          <path d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z" transform="translate(28)" />
        </clipPath>
      </defs>

      <ellipse cx="116" cy="245" rx="62" ry="7" fill={WARNA.pahat} opacity="0.16" />

      <g transform="translate(28)">
        <path d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z" fill="url(#vbatu)" />
        <path
          d="M40 244 V72 a44 44 0 0 1 88 0 V244 Z"
          fill="none"
          stroke="#8A7A5E"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
      </g>

      <g clipPath="url(#vslab)" strokeLinecap="round" strokeWidth="7">
        <g stroke="#FFFFFF" strokeOpacity="0.5" transform="translate(58 3.4)">
          {baris.map((y, i) => (
            <line key={y} x1="14" y1={y} x2={14 + panjang} y2={y} style={potong(i)} />
          ))}
        </g>
        <g stroke="#6B5C42" strokeOpacity="0.78" transform="translate(58)">
          {baris.map((y, i) => (
            <line key={y} x1="14" y1={y} x2={14 + panjang} y2={y} style={potong(i)} />
          ))}
        </g>
        <g transform="translate(58)">
          <line x1="14" y1="218" x2="68" y2="218" stroke={WARNA.tanah} style={hariIni()} />
        </g>
      </g>
    </svg>
  );
};

/**
 * Daftar serangan yang ditolak program, muncul satu per satu.
 *
 * Nama galat di kanan adalah yang benar-benar dilemparkan runtime Solana, jadi
 * baris ini bukan ilustrasi. Garis coret ditarik setelah barisnya tampil —
 * urutannya penting, sebab yang ingin terbaca adalah percobaan dulu, baru
 * penolakannya.
 */
export const Tolakan: React.FC<{
  baris: { serangan: string; galat: string }[];
  mulai?: number;
  jeda?: number;
}> = ({ baris, mulai = 0, jeda = 16 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 34 }}>
      {baris.map((b, i) => {
        const awal = mulai + i * jeda;
        const muncul = interpolate(frame - awal, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const coret = interpolate(frame - awal, [10, 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={b.serangan}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 460px",
              gap: 40,
              alignItems: "baseline",
              padding: "15px 0",
              borderBottom: `1px solid ${WARNA.pahat}22`,
              opacity: muncul,
              transform: `translateY(${interpolate(muncul, [0, 1], [10, 0])}px)`,
            }}
          >
            <div style={{ position: "relative", fontSize: 31, color: WARNA.tinta }}>
              {b.serangan}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "54%",
                  height: 2,
                  width: `${coret * 100}%`,
                  background: WARNA.tanah,
                  opacity: 0.72,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: HURUF.angka,
                fontSize: 25,
                color: WARNA.tanah,
                opacity: coret,
              }}
            >
              {b.galat}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Angka yang naik dari nol lalu berhenti sendiri. */
export const Angka: React.FC<{ nilai: number; mulai?: number }> = ({
  nilai,
  mulai = 0,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - mulai, [0, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - Math.pow(1 - t, 3);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {Math.round(nilai * eased).toLocaleString("id-ID")}
    </span>
  );
};
