"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lempeng batu, dipahat, diputar pelan, digambar dengan WebGL.
 *
 * Ini pengganti tiga dimensi bagi `Carving`, dan ia ada karena alasan yang sama
 * dengan pendahulunya: menunjukkan apa yang dikerjakan aplikasi ini tanpa satu
 * kalimat pun. Tiap alur adalah satu hari membaca yang tercatat. Alur terakhir
 * berhenti di tengah dengan warna tanah — hari ini, yang belum selesai.
 *
 * Yang membuatnya layak dibuat tiga dimensi, bukan gambar diam: pahatannya
 * tidak digambar sebagai garis. Ia dihitung sebagai lekuk pada permukaan, lalu
 * cahaya yang menyapu batu itulah yang membuatnya terlihat. Saat lempengnya
 * berputar, tiap alur berganti gelap-terang sebagaimana torehan sungguhan pada
 * batu — sesuatu yang tidak bisa ditiru oleh garis yang ditempel di atasnya.
 *
 * Ditulis langsung di atas WebGL tanpa pustaka luar. Bukan demi kesederhanaan:
 * pustaka tiga dimensi yang umum berukuran ratusan kilobita, dan halaman muka
 * yang berat justru menghalangi orang sampai ke teks yang mau dibacanya.
 */

// --- bentuk lempeng ---------------------------------------------------------
//
// Ukurannya mengikuti siluet yang sudah dipakai lambangnya: badan tegak dengan
// puncak setengah lingkaran. Angkanya ditulis dalam satuan lebar lempeng, jadi
// perbandingannya tetap sama berapa pun besarnya di layar.

const LEBAR = 0.5; // setengah lebar
const JARI = 0.5; // jari-jari puncak
const DASAR = -1.2273;
const BAHU = 0.7273;
const TEBAL = 0.075; // setengah tebal
const RUAS_BUSUR = 30;

/** Jarak mata ke lempeng, dan bukaan lensanya. */
const JARAK_MATA = 5;
const BUKAAN = 0.62;

/** Tujuh alur: enam hari penuh, satu hari yang sedang berjalan. */
const ALUR = 7;

interface Geometri {
  posisi: Float32Array;
  normal: Float32Array;
  jumlah: number;
}

function bangunLempeng(): Geometri {
  const tepi: [number, number][] = [
    [-LEBAR, DASAR],
    [LEBAR, DASAR],
  ];

  // Busur puncak, dari kanan ke kiri, supaya urutan tepinya berlawanan arah
  // jarum jam bila dilihat dari depan. Titik pertama busur berimpit dengan
  // pojok kanan atas badan, jadi sisi kanannya tidak perlu ditulis terpisah.
  for (let i = 0; i <= RUAS_BUSUR; i += 1) {
    const t = (i / RUAS_BUSUR) * Math.PI;
    tepi.push([Math.cos(t) * JARI, BAHU + Math.sin(t) * JARI]);
  }

  const posisi: number[] = [];
  const normal: number[] = [];
  const pusat: [number, number] = [0, (DASAR + BAHU + JARI) / 2];

  const segitiga = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number],
    n: [number, number, number]
  ) => {
    posisi.push(...a, ...b, ...c);
    normal.push(...n, ...n, ...n);
  };

  const n = tepi.length;

  for (let i = 0; i < n; i += 1) {
    const p = tepi[i];
    const q = tepi[(i + 1) % n];

    // Muka depan dan belakang. Bentuknya cembung — badan persegi ditambah
    // setengah lingkaran — jadi kipas segitiga dari satu titik di dalamnya
    // sudah cukup, tanpa perlu pemotongan poligon.
    segitiga(
      [pusat[0], pusat[1], TEBAL],
      [p[0], p[1], TEBAL],
      [q[0], q[1], TEBAL],
      [0, 0, 1]
    );
    segitiga(
      [pusat[0], pusat[1], -TEBAL],
      [q[0], q[1], -TEBAL],
      [p[0], p[1], -TEBAL],
      [0, 0, -1]
    );

    // Dinding samping. Normalnya tegak lurus tepi, mendatar.
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const panjang = Math.hypot(dx, dy) || 1;
    const nd: [number, number, number] = [dy / panjang, -dx / panjang, 0];

    segitiga([p[0], p[1], TEBAL], [p[0], p[1], -TEBAL], [q[0], q[1], TEBAL], nd);
    segitiga(
      [q[0], q[1], TEBAL],
      [p[0], p[1], -TEBAL],
      [q[0], q[1], -TEBAL],
      nd
    );
  }

  return {
    posisi: new Float32Array(posisi),
    normal: new Float32Array(normal),
    jumlah: posisi.length / 3,
  };
}

// --- naungan ----------------------------------------------------------------

const PUNCAK = `
attribute vec3 aPos;
attribute vec3 aNormal;

uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMat;

varying vec3 vNormal;
varying vec3 vObjNormal;
varying vec3 vLokal;
varying vec3 vDunia;

void main() {
  vec4 dunia = uModel * vec4(aPos, 1.0);
  vDunia = dunia.xyz;
  vNormal = uNormalMat * aNormal;
  vObjNormal = aNormal;
  vLokal = aPos;
  gl_Position = uProj * uView * dunia;
}
`;

/**
 * Alurnya dihitung, bukan digambar.
 *
 * `pahat()` mengembalikan kedalaman torehan di satu titik permukaan. Normalnya
 * lalu dimiringkan mengikuti kemiringan kedalaman itu, sehingga cahaya menyapu
 * dinding alur persis seperti pada batu sungguhan. Karena kedalamannya adalah
 * fungsi dari `uMaju`, pahatannya bisa berjalan: alur tumbuh dari kiri ke
 * kanan, satu per satu, dan cahayanya ikut menyesuaikan tiap bingkai tanpa
 * perlu disuruh.
 */
const SERPIH = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec3 vNormal;
varying vec3 vObjNormal;
varying vec3 vLokal;
varying vec3 vDunia;

uniform float uMaju;
uniform vec3 uBatuAtas;
uniform vec3 uBatuBawah;
uniform vec3 uTanah;
uniform vec3 uKilau;

const int ALUR = ${ALUR};
const float DASAR_Y = ${DASAR.toFixed(4)};
const float PUNCAK_Y = ${(BAHU + JARI).toFixed(4)};
const float JARAK_MATA = ${JARAK_MATA.toFixed(1)};

/** Setengah lebar alur, dan sejauh mana ujungnya dilembutkan. */
const float TEBAL_ALUR = 0.030;
const float LEMBUT = 0.022;

const float X_AWAL = -0.30;
const float PANJANG = 0.60;

float barisY(int i) {
  return 0.50 - float(i) * 0.24;
}

/** Alur terakhir sengaja separuh: hari yang sedang berjalan. */
float barisPanjang(int i) {
  return i == ALUR - 1 ? PANJANG * 0.48 : PANJANG;
}

float lekukSatu(vec2 p, int i, float maju) {
  float xAkhir = X_AWAL + barisPanjang(i) * maju;

  float ujung =
    smoothstep(X_AWAL - LEMBUT, X_AWAL + LEMBUT, p.x) *
    (1.0 - smoothstep(xAkhir - LEMBUT, xAkhir + LEMBUT, p.x));

  float jarak = abs(p.y - barisY(i)) / TEBAL_ALUR;
  return (1.0 - smoothstep(0.0, 1.0, jarak)) * ujung;
}

float pahat(vec2 p) {
  float dalam = 0.0;

  for (int i = 0; i < ALUR; i++) {
    float maju = clamp(uMaju - float(i), 0.0, 1.0);
    if (maju <= 0.0) continue;
    dalam += lekukSatu(p, i, maju);
  }

  return dalam;
}

/** Sejauh mana satu titik jatuh pada alur hari ini, dipakai untuk warnanya. */
float pahatHariIni(vec2 p) {
  float maju = clamp(uMaju - float(ALUR - 1), 0.0, 1.0);
  if (maju <= 0.0) return 0.0;
  return lekukSatu(p, ALUR - 1, maju);
}

/** Butiran batu. Tanpa ini permukaannya terbaca sebagai plastik, bukan batu. */
float bintik(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 normal = normalize(vNormal);

  // Pahatan hanya ada di muka depan. Di dinding samping dan muka belakang,
  // normalnya dibiarkan apa adanya.
  float depan = smoothstep(0.80, 0.99, vObjNormal.z);
  float dalamAlur = 0.0;
  float hariIni = 0.0;

  if (depan > 0.001) {
    float e = 0.0045;
    float h = pahat(vLokal.xy);
    float hx = pahat(vLokal.xy + vec2(e, 0.0));
    float hy = pahat(vLokal.xy + vec2(0.0, e));

    // Kedalaman alur dalam satuan yang sama dengan bidangnya, supaya
    // kemiringan dindingnya masuk akal terhadap ukuran lempengnya.
    float dalam = 0.095;
    vec3 lekuk = normalize(vec3(
      -(hx - h) / e * dalam,
      -(hy - h) / e * dalam,
      1.0
    ));

    normal = normalize(mix(normal, lekuk, depan));
    dalamAlur = h;
    hariIni = pahatHariIni(vLokal.xy);
  }

  // Cahaya utama datang dari kiri atas depan, arah yang sama dengan lambangnya.
  vec3 arahUtama = normalize(vec3(-0.55, 0.72, 0.62));
  vec3 arahIsi = normalize(vec3(0.65, -0.15, 0.45));
  vec3 keMata = normalize(vec3(0.0, 0.0, JARAK_MATA) - vDunia);

  float utama = max(dot(normal, arahUtama), 0.0);
  float isi = max(dot(normal, arahIsi), 0.0) * 0.28;

  // Cahaya tepi. Yang membuat siluetnya lepas dari latar tanpa perlu garis.
  float tepi = pow(1.0 - max(dot(normal, keMata), 0.0), 2.6) * 0.42;

  vec3 setengah = normalize(arahUtama + keMata);
  float kilau = pow(max(dot(normal, setengah), 0.0), 34.0) * 0.20;

  // Warna batu bergradasi dari puncak ke dasar: yang di bawah lebih pekat,
  // seperti benda berat yang berdiri di tanah.
  float tinggi = clamp((vLokal.y - DASAR_Y) / (PUNCAK_Y - DASAR_Y), 0.0, 1.0);
  vec3 batu = mix(uBatuBawah, uBatuAtas, tinggi);

  batu *= 0.965 + bintik(floor(vLokal.xy * 420.0)) * 0.07;
  batu = mix(batu, batu * 0.52, clamp(dalamAlur, 0.0, 1.0) * 0.70);
  batu = mix(batu, uTanah, clamp(hariIni, 0.0, 1.0) * 0.85);

  vec3 warna = batu * (0.34 + utama * 0.78 + isi) + uKilau * (tepi + kilau);

  gl_FragColor = vec4(warna, 1.0);
}
`;

// --- matriks ----------------------------------------------------------------
//
// Ditulis seperlunya. Yang dibutuhkan halaman ini hanya satu proyeksi, satu
// pandangan tetap, dan satu putaran; memuat pustaka matriks demi itu adalah
// ongkos yang tidak dibayar siapa pun.

function perspektif(fov: number, rasio: number, dekat: number, jauh: number) {
  const f = 1 / Math.tan(fov / 2);
  return new Float32Array([
    f / rasio, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (jauh + dekat) / (dekat - jauh), -1,
    0, 0, (2 * jauh * dekat) / (dekat - jauh), 0,
  ]);
}

function geser(z: number) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1]);
}

/** Putaran sumbu Y lalu sumbu X, tersusun kolom-utama seperti minta WebGL. */
function putaran(y: number, x: number) {
  const cy = Math.cos(y);
  const sy = Math.sin(y);
  const cx = Math.cos(x);
  const sx = Math.sin(x);

  return new Float32Array([
    cy, sy * sx, -sy * cx, 0,
    0, cx, sx, 0,
    sy, -cy * sx, cy * cx, 0,
    0, 0, 0, 1,
  ]);
}

/** Bagian 3x3 dari matriks model. Cukup, karena modelnya putaran murni. */
function normalDari(m: Float32Array) {
  return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]);
}

// --- warna dari kertas ------------------------------------------------------

type Rgb = [number, number, number];

/**
 * Batunya ikut tema halaman.
 *
 * Warna tanah pada alur hari ini sengaja tidak diambil dari `--accent`.
 * Aksen halaman adalah cokelat muda yang di tema gelap nyaris sewarna batunya
 * sendiri, dan alur yang seharusnya menandai hari berjalan akan lenyap ke
 * dalam permukaan. Yang dibutuhkan di sini justru warna yang membantah batu,
 * jadi ia berdiri sendiri: merah tanah, dinaikkan sedikit di tema gelap supaya
 * tetap terbaca pada permukaan yang lebih redup.
 */
function bacaWarna(gelap: boolean) {
  return {
    atas: (gelap ? [0.5, 0.47, 0.4] : [0.95, 0.925, 0.874]) as Rgb,
    bawah: (gelap ? [0.3, 0.28, 0.23] : [0.76, 0.706, 0.604]) as Rgb,
    tanah: (gelap ? [0.82, 0.39, 0.21] : [0.71, 0.314, 0.165]) as Rgb,
    kilau: (gelap ? [0.86, 0.82, 0.72] : [1, 1, 1]) as Rgb,
  };
}

// --- komponen ---------------------------------------------------------------

function susun(gl: WebGLRenderingContext, jenis: number, sumber: string) {
  const s = gl.createShader(jenis);
  if (!s) return null;
  gl.shaderSource(s, sumber);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function Monolith({
  fallback,
  className = "",
  label,
}: {
  fallback: React.ReactNode;
  className?: string;
  label: string;
}) {
  const bungkus = useRef<HTMLDivElement>(null);
  const kanvas = useRef<HTMLCanvasElement>(null);

  // Selama ini `false`, dan hanya berubah bila WebGL benar-benar tidak bisa
  // dipakai. Ditaruh di keadaan komponen supaya gambar diamnya yang tampil,
  // bukan kanvas kosong yang menyisakan lubang di tata letak.
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    const el = kanvas.current;
    const luar = bungkus.current;
    if (!el || !luar) return;

    const gl = el.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) {
      setGagal(true);
      return;
    }

    const vs = susun(gl, gl.VERTEX_SHADER, PUNCAK);
    const fs = susun(gl, gl.FRAGMENT_SHADER, SERPIH);
    const program = gl.createProgram();

    if (!vs || !fs || !program) {
      setGagal(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setGagal(true);
      return;
    }

    gl.useProgram(program);

    const geo = bangunLempeng();

    const bufPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, geo.posisi, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const bufNor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, geo.normal, gl.STATIC_DRAW);
    const aNormal = gl.getAttribLocation(program, "aNormal");
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    const u = (nama: string) => gl.getUniformLocation(program, nama);
    const uProj = u("uProj");
    const uModel = u("uModel");
    const uNormalMat = u("uNormalMat");
    const uMaju = u("uMaju");

    const malam = matchMedia("(prefers-color-scheme: dark)");

    const kirimWarna = () => {
      const w = bacaWarna(malam.matches);
      gl.uniform3fv(u("uBatuAtas"), w.atas);
      gl.uniform3fv(u("uBatuBawah"), w.bawah);
      gl.uniform3fv(u("uTanah"), w.tanah);
      gl.uniform3fv(u("uKilau"), w.kilau);
    };

    kirimWarna();

    gl.uniformMatrix4fv(u("uView"), false, geser(-JARAK_MATA));
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const tenang = matchMedia("(prefers-reduced-motion: reduce)");

    let lebar = 0;
    let tinggi = 0;

    const ukur = () => {
      // Piksel perangkat dibatasi dua. Di layar yang sangat padat, menggambar
      // pada rapat penuh membakar daya tanpa perbedaan yang terlihat.
      const rapat = Math.min(window.devicePixelRatio || 1, 2);
      const kotak = luar.getBoundingClientRect();
      const w = Math.max(1, Math.round(kotak.width * rapat));
      const h = Math.max(1, Math.round(kotak.height * rapat));
      if (w === lebar && h === tinggi) return;
      lebar = w;
      tinggi = h;
      el.width = w;
      el.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniformMatrix4fv(uProj, false, perspektif(BUKAAN, w / h, 0.1, 40));
    };

    ukur();

    let jalan = true;
    let bingkai = 0;
    let mulai = 0;
    let tampak = true;

    // Sasaran kemiringan mengikuti tetikus; nilai yang dipakai mengejarnya
    // pelan-pelan. Mengikat putaran langsung ke tetikus membuat lempengnya
    // terasa menempel di kursor, bukan berdiri di tempatnya sendiri.
    let sasaranX = 0;
    let sasaranY = 0;

    /* Miring yang mengikuti gulir.
       Sampai sekarang batunya hanya menanggapi tetikus, jadi di layar sentuh
       — dan bagi siapa pun yang membaca tanpa menggerakkan tetikus — ia
       hanya berayun sendiri dengan pola yang sama. Gulir adalah satu-satunya
       masukan yang pasti dimiliki setiap pembaca. Nilainya diambil dari letak
       batunya terhadap tengah layar, jadi ia berputar pelan sepanjang batu itu
       melintas, lalu berhenti begitu ia lewat. */
    let sasaranGulir = 0;
    const bacaGulir = () => {
      const kotak = luar.getBoundingClientRect();
      const tengah = kotak.top + kotak.height / 2;
      const bagian = tengah / window.innerHeight - 0.5;
      sasaranGulir = Math.max(-1, Math.min(1, bagian)) * 0.26;
    };
    let miringX = 0;
    let miringY = 0;

    const gerakTetikus = (e: PointerEvent) => {
      const kotak = luar.getBoundingClientRect();
      sasaranY = ((e.clientX - kotak.left) / kotak.width - 0.5) * 0.85;
      sasaranX = ((e.clientY - kotak.top) / kotak.height - 0.5) * 0.4;
    };

    const lepasTetikus = () => {
      sasaranX = 0;
      sasaranY = 0;
    };

    const gambar = (waktu: number) => {
      if (!jalan) return;

      if (!mulai) mulai = waktu;
      const detik = (waktu - mulai) / 1000;

      ukur();

      // Pahatan berjalan sekali, sekitar empat persepuluh detik per alur.
      gl.uniform1f(
        uMaju,
        tenang.matches
          ? ALUR
          : Math.min(ALUR, Math.max(0, (detik - 0.35) / 0.42))
      );

      if (tenang.matches) {
        miringY = -0.34;
        miringX = 0.06;
      } else {
        // Ayunan pelan yang tetap ada walau tetikus diam, supaya cahayanya
        // terus bergerak di alur dan batunya tidak terbaca sebagai gambar.
        const ayun = Math.sin(detik * 0.34) * 0.3 - 0.3;
        miringY += (sasaranY + ayun - miringY) * 0.055;
        miringX += (sasaranX + sasaranGulir + Math.sin(detik * 0.23) * 0.045 - miringX) * 0.055;
      }

      const model = putaran(miringY, miringX);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniformMatrix3fv(uNormalMat, false, normalDari(model));

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, geo.jumlah);

      // Bila gerak diminta dikurangi, satu bingkai sudah cukup: batunya berdiri
      // diam dan pahatannya sudah lengkap.
      if (tenang.matches) return;

      bingkai = requestAnimationFrame(gambar);
    };

    // Berhenti saat tidak terlihat. Tidak ada gunanya memutar batu yang sedang
    // berada di luar layar, dan pada perangkat bertenaga baterai itu terasa.
    const pengamat = new IntersectionObserver(
      (masuk) => {
        const kini = masuk.some((m) => m.isIntersecting);
        if (kini === tampak) return;
        tampak = kini;
        if (tampak) {
          bingkai = requestAnimationFrame(gambar);
        } else {
          cancelAnimationFrame(bingkai);
        }
      },
      { rootMargin: "120px" }
    );

    pengamat.observe(luar);
    bingkai = requestAnimationFrame(gambar);

    luar.addEventListener("pointermove", gerakTetikus);
    luar.addEventListener("pointerleave", lepasTetikus);

    // `passive` supaya pembacaan ini tidak pernah ikut menahan gulir. Nilainya
    // hanya dicatat di sini; yang memakainya adalah bingkai berikutnya, jadi
    // tidak ada tata letak yang dihitung ulang di tengah gulir.
    bacaGulir();
    window.addEventListener("scroll", bacaGulir, { passive: true });
    window.addEventListener("resize", bacaGulir);
    malam.addEventListener("change", kirimWarna);

    const ukurUlang = new ResizeObserver(() => ukur());
    ukurUlang.observe(luar);

    // Peramban boleh mencabut konteks kapan saja — kartu grafis yang sibuk,
    // tab yang lama tersembunyi. Bila itu terjadi, gambar diamnya yang dipakai,
    // bukan kanvas kosong.
    const hilang = (e: Event) => {
      e.preventDefault();
      jalan = false;
      setGagal(true);
    };
    el.addEventListener("webglcontextlost", hilang);

    return () => {
      jalan = false;
      cancelAnimationFrame(bingkai);
      pengamat.disconnect();
      ukurUlang.disconnect();
      luar.removeEventListener("pointermove", gerakTetikus);
      luar.removeEventListener("pointerleave", lepasTetikus);
      window.removeEventListener("scroll", bacaGulir);
      window.removeEventListener("resize", bacaGulir);
      malam.removeEventListener("change", kirimWarna);
      el.removeEventListener("webglcontextlost", hilang);
      gl.deleteBuffer(bufPos);
      gl.deleteBuffer(bufNor);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  if (gagal) return <>{fallback}</>;

  return (
    // Lebarnya ditulis tetap, bukan `w-full`. Kanvas tidak punya rasio bawaan
    // seperti SVG, jadi di dalam kolom grid yang lebarnya menyusut-pas-isi,
    // lebar persentase tidak punya acuan dan meluruh jadi nol — kanvas nol
    // piksel yang tetap lolos kompilasi dan tetap menggambar, hanya saja tidak
    // ke mana-mana.
    <div
      ref={bungkus}
      className={`relative aspect-[3/4] w-[280px] max-w-full ${className}`}
    >
      {/* Bayangan tumpu. Tanpa ini lempengnya melayang: mata membaca benda
          berat yang tidak menyentuh apa pun sebagai gambar tempelan, bukan
          sebagai benda. Digambar di belakang kanvas, bukan di dalam naungan,
          karena lantainya sendiri tidak ada di adegan itu. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-1 h-5 rounded-[50%] opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--ink) 34%, transparent), transparent)",
        }}
      />
      <canvas
        ref={kanvas}
        className="relative h-full w-full"
        role="img"
        aria-label={label}
      />
    </div>
  );
}
