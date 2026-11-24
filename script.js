/**
 * HRD PT RAJA PALMA — Lembur.gs (rebuild v2)
 * Sumber kebenaran tanggal & jam: rincian_harian_json = array [{tanggal, jam}].
 * Frontend tidak lagi parse string atau menebak tanggal dari kolom "tanggal".
 * Impor baru mengirim rincian harian numerik; tanggal dijamin ISO YYYY-MM-DD.
 */

const LBR = {
  TAB: 'lembur_karyawan',
  PENGAPALAN_TAB: 'lembur_pengapalan',
  HEADER: [
    'id', 'periode', 'no_absen', 'nama', 'divisi',
    'tanggal_mulai', 'tanggal_akhir',
    'rincian_harian_json', 'total_jam',
    'bagian_excel', 'jabatan_excel', 'status',
    'sumber_file', 'diimpor_pada', 'diubah_pada'
  ],
  MAKS_IMPOR: 500
};

const PORTAL_LEMBUR_PENGATURAN_TAB_ = 'pengaturan_lembur';

const TARIF = {
  TAB: 'pengaturan_tarif_upah',
  HEADER: ['cakupan', 'kunci', 'nama', 'divisi', 'upah_harian', 'tarif_lembur_per_jam', 'aktif', 'diubah_pada']
};

const REKAP = {
  TAB: 'rekapan_gaji',
  HEADER: ['id_run', 'periode_dari', 'periode_sampai', 'no_absen', 'nama', 'divisi', 'hari_dibayar',
    'upah_harian', 'nominal_gaji', 'jam_lembur', 'tarif_lembur_per_jam', 'nominal_lembur', 'total_nominal', 'dihitung_pada']
};

/* ---------- STATUS KARYAWAN YANG TIDAK DIHITUNG GAJI HARIAN ---------- */
/* Tambahkan kode status lain di sini bila kebijakan HRD berubah. */
const REKAP_STATUS_TANPA_GAJI_HARIAN = ['HT', 'KT'];

function portalStatusTanpaGajiHarian_(status) {
  var s = String(status || '').trim().toUpperCase();
  return REKAP_STATUS_TANPA_GAJI_HARIAN.indexOf(s) >= 0;
}
const MAP_LBR = {
  TAB: 'mapping_lembur',
  HEADER: ['nama_excel', 'no_absen', 'nama_master', 'dibuat_pada']
};

/* ---------- SETUP ---------- */
function setupLembur_(ss) {
  buatTab_(ss, LBR.TAB, LBR.HEADER, []);
  buatTab_(ss, LBR.PENGAPALAN_TAB, LBR.HEADER, []);
  try { ss.getSheetByName(LBR.TAB).getRange('A:O').setNumberFormat('@'); } catch (e) {}
  try { ss.getSheetByName(LBR.PENGAPALAN_TAB).getRange('A:O').setNumberFormat('@'); } catch (e) {}
  portalSheetDenganHeader_(TARIF.TAB, TARIF.HEADER);
  produksiOffSheet_();   // aturan Off/libur: satu sheet pengaturan_produksi_off (kalender_libur_divisi sudah digabung)
  portalSheetDenganHeader_(REKAP.TAB, REKAP.HEADER);
  portalSheetDenganHeader_(MAP_LBR.TAB, MAP_LBR.HEADER);
}

function portalSheetDenganHeader_(nama, header) {
  var ss = ambilSheet_();
  var sh = ss.getSheetByName(nama);
  if (!sh) sh = buatTab_(ss, nama, header, []);
  var last = Math.max(1, sh.getLastColumn());
  var ada = sh.getRange(1, 1, 1, Math.max(last, header.length)).getDisplayValues()[0];
  header.forEach(function (h, i) {
    var sekarang = String(ada[i] || '').trim();
    if (!sekarang) sh.getRange(1, i + 1).setValue(h);
    else if (sekarang.toLowerCase() !== h.toLowerCase()) {
      throw new Error('Header sheet ' + nama + ' tidak sesuai pada kolom ' + (i + 1) + '.');
    }
  });
  return sh;
}

/* ---------- SHEET & BACA ---------- */
function portalLemburSheet_(namaTab) {
  var ss = ambilSheet_();
  var nama = namaTab || LBR.TAB;
  if ([LBR.TAB, LBR.PENGAPALAN_TAB].indexOf(nama) < 0) throw new Error('Sheet lembur tidak dikenal.');
  var sh = ss.getSheetByName(nama);
  if (!sh) sh = buatTab_(ss, nama, LBR.HEADER, []);
  var header = sh.getRange(1, 1, 1, LBR.HEADER.length).getDisplayValues()[0];
  if (header.join('|') !== LBR.HEADER.join('|')) {
    throw new Error('Header sheet ' + nama + ' tidak sesuai. Jalankan setupLembur_() lalu periksa header.');
  }
  return sh;
}

function portalLemburBacaRows_(namaTab) {
  var nama = namaTab || LBR.TAB;
  var sh = portalLemburSheet_(nama);
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, LBR.HEADER.length).getDisplayValues().map(function (r, i) {
    var rincian = [];
    try {
      var arr = JSON.parse(r[7] || '[]');
      if (Array.isArray(arr)) {
        rincian = arr.map(function (x) {
          return { tanggal: String(x.tanggal || '').trim(), jam: Number(x.jam) || 0 };
        }).filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x.tanggal) && x.jam > 0; });
      }
    } catch (e) { rincian = []; }
    return {
      row: i + 2,
      sheet: nama,
      id: String(r[0] || '').trim(),
      periode: String(r[1] || '').trim(),
      no_absen: String(r[2] || '').trim(),
      nama: String(r[3] || '').trim(),
      divisi: String(r[4] || '').trim(),
      tanggal_mulai: String(r[5] || '').trim(),
      tanggal_akhir: String(r[6] || '').trim(),
      rincian_harian: rincian,
      total_jam: Number(r[8]) || 0,
      bagian_excel: String(r[9] || '').trim(),
      jabatan_excel: String(r[10] || '').trim(),
      status: String(r[11] || '').trim(),
      sumber_file: String(r[12] || '').trim()
    };
  });
}

// Gabungan untuk perhitungan dan endpoint lama; kategori tetap dapat dibedakan dari bagian_excel.
function portalLemburBacaSemuaRows_() {
  return portalLemburBacaRows_(LBR.TAB).concat(portalLemburBacaRows_(LBR.PENGAPALAN_TAB));
}

// Jalankan satu kali setelah deploy untuk memindahkan data PENGAPALAN lama dari sheet reguler.
function migrasiLemburPengapalan_() {
  return denganKunci_(function () {
    var reguler = portalLemburSheet_(LBR.TAB);
    var khusus = portalLemburSheet_(LBR.PENGAPALAN_TAB);
    var last = reguler.getLastRow();
    if (last < 2) return { ok: true, dipindah: 0, duplikat: 0 };
    var rows = reguler.getRange(2, 1, last - 1, LBR.HEADER.length).getDisplayValues();
    var lastKhusus = khusus.getLastRow();
    var khususRows = lastKhusus > 1 ? khusus.getRange(2, 1, lastKhusus - 1, LBR.HEADER.length).getDisplayValues() : [];
    var keys = Object.create(null);
    khususRows.forEach(function (r) { keys[String(r[1]).trim() + '|' + portalKunciNoAbsen_(r[2]) + '|' + String(r[9]).trim()] = true; });
    var pindah = [], hapus = [], duplikat = 0;
    rows.forEach(function (r, i) {
      if (String(r[9] || '').trim().toUpperCase() !== 'PENGAPALAN') return;
      var key = String(r[1]).trim() + '|' + portalKunciNoAbsen_(r[2]) + '|' + String(r[9]).trim();
      if (!keys[key]) { pindah.push(r); keys[key] = true; }
      else duplikat++;
      hapus.push(i + 2);
    });
    if (pindah.length) khusus.getRange(khusus.getLastRow() + 1, 1, pindah.length, LBR.HEADER.length).setNumberFormat('@').setValues(pindah);
    hapus.reverse().forEach(function (row) { reguler.deleteRow(row); });
    catat_('admin', 'lembur_migrasi_pengapalan', 'dipindah=' + pindah.length + '; duplikat=' + duplikat);
    return { ok: true, dipindah: pindah.length, duplikat: duplikat };
  });
}

/* ---------- DAFTAR (admin) ---------- */
function portalLemburDaftar(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var dari = normalTanggal_(param.dari);
  var sampai = normalTanggal_(param.sampai);
  var cari = String(param.cari || '').trim().toLowerCase();
  var divisiF = String(param.divisi || '').trim().toLowerCase();

  var semua = portalLemburBacaSemuaRows_();
  var out = [];
  semua.forEach(function (row) {
    if (cari && (row.nama + ' ' + row.no_absen).toLowerCase().indexOf(cari) < 0) return;
    if (divisiF && row.divisi.toLowerCase() !== divisiF) return;

    var rincian = row.rincian_harian;
    if (dari || sampai) {
      rincian = rincian.filter(function (x) {
        return (!dari || x.tanggal >= dari) && (!sampai || x.tanggal <= sampai);
      });
    }
    if (!rincian.length) return;

    out.push({
      id: row.id,
      periode: row.periode,
      no_absen: row.no_absen,
      nama: row.nama,
      divisi: row.divisi,
      bagian_excel: row.bagian_excel,
      jabatan_excel: row.jabatan_excel,
      status: row.status,
      sumber_file: row.sumber_file,
      rincian_harian: rincian,
      total_jam: Math.round(rincian.reduce(function (s, x) { return s + x.jam; }, 0) * 100) / 100
    });
  });
  out.sort(function (a, b) {
    return String(a.nama).localeCompare(String(b.nama), 'id', { sensitivity: 'base' });
  });
  return { ok: true, data: out, total: out.length };
}

/* ---------- DAFTAR (karyawan, shape sama) ---------- */
function karyawanLemburDaftar(token, param) {
  // 1. Cek sesi terlebih dahulu
  var s = sesi_(token);
  
  // 2. Jika ADMIN, langsung arahkan ke fungsi daftar admin (Bypass cek hak akses karyawan)
  if (s.peran === 'admin') return portalLemburDaftar(token, param);
  
  // 3. Jika KARYAWAN, baru lakukan validasi wajib karyawan & cek hak akses
  var auth = portalWajibKaryawan_(token);
  var hak = portalHakMenu_(auth, 'lembur');
  
  param = param || {};
  var dari = normalTanggal_(param.dari);
  var sampai = normalTanggal_(param.sampai);

  var semua = portalLemburBacaSemuaRows_();
  var semuaAkses = hak.cakupan === 'semua';
  var perDivisi = hak.cakupan === 'divisi';
  var kunciSendiri = portalKunciNoAbsen_(auth.akun.noAbsen);
  var petaDivisi = perDivisi ? portalPetaDivisiByNo_() : null;
  var daftarDivisi = perDivisi ? portalDivisiBoleh_(auth, hak) : [];

  var out = [];
  semua.forEach(function (row) {
    if (!semuaAkses) {
      if (perDivisi) {
        var divBaris = petaDivisi[portalKunciNoAbsen_(row.no_absen)] || '';
        var cocok = (daftarDivisi || []).some(function (d) {
          return String(d).toLowerCase() === String(divBaris).toLowerCase();
        });
        if (!cocok) return;
      } else if (portalKunciNoAbsen_(row.no_absen) !== kunciSendiri) {
        return;
      }
    }
    var rincian = row.rincian_harian;
    if (dari || sampai) {
      rincian = rincian.filter(function (x) {
        return (!dari || x.tanggal >= dari) && (!sampai || x.tanggal <= sampai);
      });
    }
    if (!rincian.length) return;
    out.push({
      id: row.id,
      periode: row.periode,
      no_absen: row.no_absen,
      nama: row.nama,
      divisi: row.divisi,
      bagian_excel: row.bagian_excel,
      jabatan_excel: row.jabatan_excel,
      status: row.status,
      rincian_harian: rincian,
      total_jam: Math.round(rincian.reduce(function (s, x) { return s + x.jam; }, 0) * 100) / 100
    });
  });
  out.sort(function (a, b) {
    return String(a.nama).localeCompare(String(b.nama), 'id', { sensitivity: 'base' });
  });
  return { ok: true, data: out, cakupan: hak.cakupan || 'sendiri' };
}

/* ---------- IMPOR ---------- */
function portalLemburImpor(token, rows) {
  wajibAdmin_(token);
  if (!Array.isArray(rows) || !rows.length) {
    return { ok: false, pesan: 'Tidak ada data rekap lembur.' };
  }
  if (rows.length > LBR.MAKS_IMPOR) {
    return { ok: false, pesan: 'Maksimal ' + LBR.MAKS_IMPOR + ' baris per impor.' };
  }

var master = bacaKaryawan_(siap_()).slice();
if (typeof bacaTenagaPenugasan_ === 'function') {
  bacaTenagaPenugasan_().forEach(function (t) {
    if (!t.aktif || !t.noAbsen) return;
    master.push({ noAbsen: t.noAbsen, nama: t.nama, divisi: t.divisi, status: t.status });
  });
}
  var masterByNo = Object.create(null);
  master.forEach(function (k) {
    var c = portalKunciNoAbsen_(k.noAbsen);
    if (c) masterByNo[c] = k;
  });

  var ditolak = 0, alasan = [], bersih = [];

  rows.forEach(function (x) {
    x = x || {};
    var noAbsen = String(x.noAbsen || '').trim();
    var periode = String(x.periode || '').trim();
    var bagian = String(x.bagian || '').trim();
    var jabatan = String(x.jabatan || '').trim();
    var file = String(x.file || '').trim();
    var rincian = Array.isArray(x.rincian) ? x.rincian : [];

    var sebab = '';
    if (!noAbsen) sebab = 'no absen kosong';
    else if (!periode) sebab = 'periode kosong';
    else if (!bagian) sebab = 'bagian kosong';
    else if (!rincian.length) sebab = 'rincian kosong';
    if (sebab) {
      ditolak++;
      if (alasan.length < 10) alasan.push((x.nama || noAbsen) + ': ' + sebab);
      return;
    }

    var k = masterByNo[portalKunciNoAbsen_(noAbsen)];
    if (!k) {
      ditolak++;
      if (alasan.length < 10) alasan.push(noAbsen + ': tidak ada di master');
      return;
    }
    if (portalDivisiAktiva_(k.divisi)) {
      ditolak++;
      if (alasan.length < 10) alasan.push(noAbsen + ': Aktiva Bangunan tidak dihitung lembur');
      return;
    }

    var rincianBersih = [];
    rincian.forEach(function (r) {
      var tgl = parseTanggalLemburAman_(r.tanggal);
      var jam = Number(String(r.jam == null ? '' : r.jam).replace(',', '.'));
      if (!tgl || !isFinite(jam) || jam < 0) return;
      rincianBersih.push({ tanggal: tgl, jam: Math.round(jam * 100) / 100 });
    });
    if (!rincianBersih.length) {
      ditolak++;
      if (alasan.length < 10) alasan.push(noAbsen + ': rincian tidak valid');
      return;
    }
    rincianBersih.sort(function (a, b) { return a.tanggal.localeCompare(b.tanggal); });

    var total = rincianBersih.reduce(function (s, r) { return s + r.jam; }, 0);
    bersih.push({
      noAbsen: portalNoAbsen_(k.noAbsen),
      nama: k.nama || '',
      divisi: k.divisi || '',
      periode: periode,
      bagian: bagian,
      jabatan: jabatan,
      file: file,
      rincian: rincianBersih,
      total: Math.round(total * 100) / 100,
      mulai: rincianBersih[0].tanggal,
      akhir: rincianBersih[rincianBersih.length - 1].tanggal
    });
  });

  if (!bersih.length) {
    return { ok: false, pesan: 'Tidak ada baris valid.', ditolak: ditolak, alasan: alasan };
  }

  return denganKunci_(function () {
    var targetTabs = [LBR.TAB, LBR.PENGAPALAN_TAB];
    var indeks = Object.create(null), dataByTab = Object.create(null);
    targetTabs.forEach(function (nama) {
      var sh = portalLemburSheet_(nama), last = sh.getLastRow();
      var data = last > 1 ? sh.getRange(2, 1, last - 1, LBR.HEADER.length).getDisplayValues() : [];
      dataByTab[nama] = data;
      var posisi = Object.create(null);
      data.forEach(function (r, i) {
        var key = String(r[1]).trim() + '|' + portalKunciNoAbsen_(r[2]) + '|' + String(r[9]).trim();
        posisi[key] = i;
      });
      indeks[nama] = posisi;
    });

    var baru = 0, diperbarui = 0, now = sekarang_('yyyy-MM-dd HH:mm:ss');
    bersih.forEach(function (b) {
      var target = String(b.bagian || '').trim().toUpperCase() === 'PENGAPALAN' ? LBR.PENGAPALAN_TAB : LBR.TAB;
      var data = dataByTab[target], posisi = indeks[target];
      var key = b.periode + '|' + portalKunciNoAbsen_(b.noAbsen) + '|' + b.bagian;
      var nilai;
      if (posisi[key] !== undefined) {
        var idx = posisi[key];
        var idLama = String(data[idx][0] || '').trim() || ('LBR-' + Utilities.getUuid().slice(0, 8).toUpperCase());
        var rincianLama = [];
        try { rincianLama = JSON.parse(data[idx][7] || '[]'); if (!Array.isArray(rincianLama)) rincianLama = []; } catch (e) { rincianLama = []; }
        var mapTanggal = Object.create(null);
        rincianLama.forEach(function (r) {
          var tgl = parseTanggalLemburAman_(r.tanggal), jam = Number(r.jam);
          if (tgl && isFinite(jam) && jam > 0) mapTanggal[tgl] = jam;
        });
        var adaPerubahan = false, tanggalDariFile = Object.create(null);
        b.rincian.forEach(function (r) {
          var tgl = r.tanggal, jamBaru = Number(r.jam) || 0;
          tanggalDariFile[tgl] = true;
          var lama = mapTanggal[tgl];
          if (jamBaru > 0) { if (lama !== jamBaru) { mapTanggal[tgl] = jamBaru; adaPerubahan = true; } }
          else if (lama !== undefined) { delete mapTanggal[tgl]; adaPerubahan = true; }
        });
        Object.keys(mapTanggal).forEach(function (tgl) { if (!tanggalDariFile[tgl]) { delete mapTanggal[tgl]; adaPerubahan = true; } });
        if (!adaPerubahan) return;
        var rincianGabungan = Object.keys(mapTanggal).filter(function (tgl) { return Number(mapTanggal[tgl]) > 0; }).sort()
          .map(function (tgl) { return { tanggal: tgl, jam: mapTanggal[tgl] }; });
        var totalGabungan = rincianGabungan.reduce(function (sum, r) { return sum + r.jam; }, 0);
        nilai = [idLama, b.periode, b.noAbsen, b.nama, b.divisi,
          rincianGabungan.length ? rincianGabungan[0].tanggal : '',
          rincianGabungan.length ? rincianGabungan[rincianGabungan.length - 1].tanggal : '',
          JSON.stringify(rincianGabungan), String(Math.round(totalGabungan * 100) / 100),
          b.bagian, b.jabatan, data[idx][11] || 'Disetujui Manager', b.file || data[idx][12], data[idx][13] || now, now];
        data[idx] = nilai.map(String); diperbarui++;
      } else {
        nilai = ['LBR-' + Utilities.getUuid().slice(0, 8).toUpperCase(), b.periode, b.noAbsen, b.nama, b.divisi,
          b.mulai, b.akhir, JSON.stringify(b.rincian), String(b.total), b.bagian, b.jabatan,
          'Disetujui Manager', b.file, now, now];
        data.push(nilai.map(String)); posisi[key] = data.length - 1; baru++;
      }
    });

    targetTabs.forEach(function (nama) {
      var data = dataByTab[nama];
      if (!data.length) return;
      portalLemburSheet_(nama).getRange(2, 1, data.length, LBR.HEADER.length).setNumberFormat('@').setValues(data);
    });
    catat_('admin', 'lembur_impor', 'baru=' + baru + '; diperbarui=' + diperbarui + '; ditolak=' + ditolak);
    return { ok: true, baru: baru, diperbarui: diperbarui, ditolak: ditolak, alasan: alasan,
      reguler: dataByTab[LBR.TAB].length, pengapalan: dataByTab[LBR.PENGAPALAN_TAB].length };
  });
}

/* ---------- EDIT PER HARI ---------- */
function portalLemburEdit(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var id = String(param.id || '').trim();
  var tanggal = parseTanggalLemburAman_(param.tanggal);
  var jam = Number(String(param.jam == null ? '' : param.jam).replace(',', '.'));
  if (!id) return { ok: false, pesan: 'ID lembur tidak valid.' };
  if (!tanggal) return { ok: false, pesan: 'Tanggal tidak valid.' };
  if (!isFinite(jam) || jam < 0 || jam > 24) return { ok: false, pesan: 'Jam harus angka 0–24.' };

  return denganKunci_(function () {
    var sh = null, rows = [], idx = -1;
    [LBR.TAB, LBR.PENGAPALAN_TAB].some(function (nama) {
      var kandidat = portalLemburSheet_(nama), last = kandidat.getLastRow();
      if (last < 2) return false;
      var data = kandidat.getRange(2, 1, last - 1, LBR.HEADER.length).getDisplayValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === id) { sh = kandidat; rows = data; idx = i; return true; }
      }
      return false;
    });
    if (idx < 0 || !sh) return { ok: false, pesan: 'Data lembur tidak ditemukan.' };

    var rincian = [];
    try { rincian = JSON.parse(rows[idx][7] || '[]'); } catch (e) { rincian = []; }
    if (!Array.isArray(rincian)) rincian = [];

    var ketemu = false;
    rincian.forEach(function (r) {
      if (r.tanggal === tanggal) { r.jam = jam; ketemu = true; }
    });
    if (!ketemu && jam > 0) rincian.push({ tanggal: tanggal, jam: jam });
    rincian = rincian.filter(function (r) { return Number(r.jam) > 0; });
    rincian.sort(function (a, b) { return a.tanggal.localeCompare(b.tanggal); });

    var total = Math.round(rincian.reduce(function (s, r) { return s + Number(r.jam); }, 0) * 100) / 100;
    var mulai = rincian.length ? rincian[0].tanggal : '';
    var akhir = rincian.length ? rincian[rincian.length - 1].tanggal : '';
    var now = sekarang_('yyyy-MM-dd HH:mm:ss');

    sh.getRange(idx + 2, 6, 1, 10).setValues([[
      mulai, akhir, JSON.stringify(rincian), String(total),
      rows[idx][9], rows[idx][10], rows[idx][11], rows[idx][12], rows[idx][13], now
    ]]);
    catat_('admin', 'lembur_edit', 'id=' + id + '; tanggal=' + tanggal + '; jam=' + jam);
    return { ok: true, pesan: 'Jam lembur diperbarui.', total_jam: total };
  });
}

/* ---------- HAPUS ---------- */
function portalLemburHapus(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var id = String(param.id || '').trim();
  if (!id) return { ok: false, pesan: 'ID lembur tidak valid.' };
  return denganKunci_(function () {
    var ditemukan = false;
    [LBR.TAB, LBR.PENGAPALAN_TAB].some(function (nama) {
      var sh = portalLemburSheet_(nama), last = sh.getLastRow();
      if (last < 2) return false;
      var ids = sh.getRange(2, 1, last - 1, 1).getDisplayValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]).trim() === id) { sh.deleteRow(i + 2); ditemukan = true; return true; }
      }
      return false;
    });
    if (!ditemukan) return { ok: false, pesan: 'Data lembur tidak ditemukan.' };
    catat_('admin', 'lembur_hapus', 'id=' + id);
    return { ok: true, pesan: 'Data lembur dihapus.' };
  });
}

/* ---------- LEGACY PENGATURAN (wrapper ke tarif) ---------- */
function portalLemburPengaturanSheet_() {
  var ss = ambilSheet_();
  var sh = ss.getSheetByName(PORTAL_LEMBUR_PENGATURAN_TAB_);
  if (!sh) {
    sh = ss.insertSheet(PORTAL_LEMBUR_PENGATURAN_TAB_);
    sh.getRange(1, 1, 3, 3).setValues([
      ['kunci', 'nilai', 'diubah_pada'],
      ['upah_harian', '', ''],
      ['tarif_lembur_per_jam', '', '']
    ]);
    sh.getRange('A:C').setNumberFormat('@');
  }
  return sh;
}

function portalLemburPengaturanAmbil(token) {
  wajibAdmin_(token);
  var r = portalTarifAmbil(token);
  var g = r.global || {};
  return {
    ok: true,
    pengaturan: {
      upahHarian: g.upahHarian || '',
      tarifLemburPerJam: g.tarifLemburPerJam || '',
      diubahPada: g.diubahPada || ''
    }
  };
}

function portalLemburPengaturanSimpan(token, data) {
  wajibAdmin_(token);
  data = data || {};
  var r = portalTarifAmbil(token);
  var g = r.global || {};
  var upah = data.upahHarian === undefined || data.upahHarian === '' ? (g.upahHarian || '') : data.upahHarian;
  var tarif = data.tarifLemburPerJam === undefined || data.tarifLemburPerJam === '' ? (g.tarifLemburPerJam || '') : data.tarifLemburPerJam;
  return portalTarifSimpan(token, { cakupan: 'global', upahHarian: upah, tarifLemburPerJam: tarif });
}

/* ---------- TARIF ---------- */
function portalTarifSheet_() { return portalSheetDenganHeader_(TARIF.TAB, TARIF.HEADER); }

function portalTarifNominal_(v, label, bolehKosong) {
  var s = String(v == null ? '' : v).trim();
  if (!s && bolehKosong) return '';
  var n = Number(s.replace(/[^0-9,.-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.'));
  if (!isFinite(n) || n < 0 || n > 1000000000) throw new Error((label || 'Nominal') + ' tidak valid. Isi angka Rupiah 0 atau lebih.');
  return String(Math.round(n));
}

function portalKunciIdentitasExact_(v) { return String(v == null ? '' : v).trim().replace(/\s+/g, '').toUpperCase(); }

function portalTarifKunci_(cakupan, kunci) {
  if (cakupan === 'pegawai') return portalKunciIdentitasExact_(kunci);
  if (cakupan === 'divisi') return String(kunci || '').trim().toLowerCase();
  return '*';
}

function portalTarifMigrasiGlobal_() {
  var sh = portalTarifSheet_();
  if (sh.getLastRow() > 1) return;
  var harian = '', lembur = '';
  try {
    var lama = portalLemburPengaturanSheet_();
    if (lama.getLastRow() > 1) {
      lama.getRange(2, 1, lama.getLastRow() - 1, 3).getDisplayValues().forEach(function (r) {
        if (r[0] === 'upah_harian') harian = r[1];
        if (r[0] === 'tarif_lembur_per_jam') lembur = r[1];
      });
    }
  } catch (e) {}
  if (harian || lembur) {
    sh.getRange(sh.getLastRow() + 1, 1, 1, TARIF.HEADER.length).setNumberFormat('@')
      .setValues([['global', '*', 'Semua Divisi', '', harian, lembur, 'ya', sekarang_('yyyy-MM-dd HH:mm:ss')]]);
  }
}

function portalTarifAmbil(token) {
  wajibAdmin_(token);
  portalTarifMigrasiGlobal_();
  var sh = portalTarifSheet_();
  var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, TARIF.HEADER.length).getDisplayValues() : [];
  var daftar = rows.map(function (r) {
    return { cakupan: r[0], kunci: r[1], nama: r[2], divisi: r[3], upahHarian: r[4],
      tarifLemburPerJam: r[5], aktif: r[6] !== 'tidak', diubahPada: r[7] };
  }).filter(function (x) { return x.aktif; });
  var global = daftar.filter(function (x) { return x.cakupan === 'global'; })[0] || { upahHarian: '', tarifLemburPerJam: '' };
  return { ok: true, global: global, khusus: daftar.filter(function (x) { return x.cakupan !== 'global'; }) };
}

function portalTarifSimpan(token, data) {
  wajibAdmin_(token);
  data = data || {};
  var cakupan = ['global', 'divisi', 'pegawai'].indexOf(String(data.cakupan || '')) >= 0 ? String(data.cakupan) : '';
  if (!cakupan) throw new Error('Jenis tarif tidak valid.');
  var kunci = cakupan === 'global' ? '*' : String(data.kunci || '').trim();
  if (cakupan !== 'global' && !kunci) throw new Error('Pilih divisi atau karyawan terlebih dahulu.');
  var nama = cakupan === 'global' ? 'Semua Divisi' : '', divisi = cakupan === 'divisi' ? kunci : String(data.divisi || '').trim();
  if (cakupan === 'pegawai') {
    var cocok = bacaKaryawan_(siap_()).filter(function (k) { return portalKunciIdentitasExact_(k.noAbsen) === portalKunciIdentitasExact_(kunci); });
    if (cocok.length !== 1) throw new Error('Karyawan tidak ditemukan atau nomor absen/ID-nya ganda pada master.');
    nama = cocok[0].nama || '';
    divisi = cocok[0].divisi || '';
  } else if (cakupan === 'divisi') {
    var adaDivisi = bacaKaryawan_(siap_()).some(function (k) { return String(k.divisi || '').trim().toLowerCase() === kunci.toLowerCase(); });
    if (!adaDivisi) throw new Error('Divisi tidak ditemukan pada master karyawan.');
  }
  var upah = portalTarifNominal_(data.upahHarian, 'Upah harian', true);
  var tarif = portalTarifNominal_(data.tarifLemburPerJam, 'Tarif lembur per jam', true);
  if (!upah && !tarif) throw new Error('Isi minimal salah satu tarif.');
  var sh = portalTarifSheet_();
  var last = sh.getLastRow();
  var rows = last > 1 ? sh.getRange(2, 1, last - 1, TARIF.HEADER.length).getDisplayValues() : [];
  var key = portalTarifKunci_(cakupan, kunci);
  var row = -1;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0] === cakupan && portalTarifKunci_(cakupan, rows[i][1]) === key) { row = i + 2; break; }
  }
  if (cakupan === 'divisi') nama = kunci;
  var vals = [cakupan, kunci, nama, divisi, upah, tarif, 'ya', sekarang_('yyyy-MM-dd HH:mm:ss')];
  if (row < 0) row = sh.getLastRow() + 1;
  sh.getRange(row, 1, 1, vals.length).setNumberFormat('@').setValues([vals]);
  catat_('admin', 'tarif_upah_simpan', cakupan + ':' + key + '; harian=' + upah + '; lembur=' + tarif);
  return { ok: true, pesan: 'Tarif berhasil disimpan.' };
}

function portalTarifHapus(token, data) {
  wajibAdmin_(token);
  data = data || {};
  var cakupan = String(data.cakupan || ''), key = portalTarifKunci_(cakupan, data.kunci || '');
  if (['divisi', 'pegawai'].indexOf(cakupan) < 0 || !key) throw new Error('Tarif khusus tidak valid.');
  var sh = portalTarifSheet_(), last = sh.getLastRow();
  if (last < 2) throw new Error('Tarif khusus tidak ditemukan.');
  var rows = sh.getRange(2, 1, last - 1, TARIF.HEADER.length).getDisplayValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (rows[i][0] === cakupan && portalTarifKunci_(cakupan, rows[i][1]) === key) {
      sh.deleteRow(i + 2);
      return { ok: true, pesan: 'Tarif khusus dihapus.' };
    }
  }
  throw new Error('Tarif khusus tidak ditemukan.');
}

/* ---------- KALENDER KERJA & LIBUR ----------
   Sekarang hanya pembungkus untuk sheet pengaturan_produksi_off (satu aturan untuk libur dan Off produksi).
   Nama fungsi dipertahankan agar Portal Admin lama tetap jalan. */
function portalKalenderKerjaAmbil(token) {
  wajibAdmin_(token);
  var aturan = produksiOffDaftar_().aturan || [];
  var libur = [];   // bentuk lama: satu baris per (tanggal, divisi); '*' = semua divisi
  aturan.forEach(function (o) {
    var dasar = { id: o.id, tanggal: o.tanggal, alasan: o.alasan, aktif: true, jenis: o.jenis, cakupan: o.cakupan };
    if (o.cakupan === 'pegawai') { libur.push(Object.assign({}, dasar, { divisi: '', noAbsen: o.noAbsen })); return; }
    (o.divisi && o.divisi.length ? o.divisi : ['*']).forEach(function (d) { libur.push(Object.assign({}, dasar, { divisi: d })); });
  });
  libur.sort(function (a, b) { return String(a.tanggal).localeCompare(String(b.tanggal)); });
  return { ok: true, aturanMingguan: { umum: 'Minggu', 'Aktiva Bangunan': 'Jumat' }, libur: libur, aturan: aturan };
}

function portalKalenderKerjaSimpan(token, data) {
  wajibAdmin_(token);
  data = Object.assign({}, data || {});
  var tanggal = normalTanggal_(data.tanggal);
  if (!tanggal) throw new Error('Tanggal tidak valid.');
  var jenis = data.jenis === 'off' ? 'off' : 'libur';
  var res = produksiOffSimpan_(token, {
    tanggal: tanggal,
    jenis: jenis,
    cakupan: data.cakupan === 'pegawai' ? 'pegawai' : 'divisi',
    divisi: Array.isArray(data.divisi) ? data.divisi : (String(data.divisi || '*').trim() ? [String(data.divisi || '*').trim()] : []),
    noAbsen: data.noAbsen,
    alasan: portalBersihTeks_(data.alasan || (jenis === 'off' ? 'Off produksi' : 'Libur perusahaan'), 120)
  });
  catat_('admin', 'kalender_libur_simpan', tanggal + '; ' + jenis + '; ' + JSON.stringify(data.divisi || data.noAbsen || '*'));
  return res;
}

function portalKalenderKerjaHapus(token, id) {
  wajibAdmin_(token);
  return produksiOffHapus_(token, id);
}

/* ---------- ATURAN LIBUR & TARIF EFEKTIF ---------- */
function portalDivisiAktiva_(divisi) {
  return String(divisi || '').trim().toLowerCase() === 'aktiva bangunan';
}

/* Aturan hari tidak kerja untuk perhitungan gaji/lembur: libur mingguan + semua aturan (libur dan Off produksi).
   'libur' = aturan dari produksiOffDaftar_().aturan (cakupan semua divisi / pilihan divisi / karyawan). */
function portalTanggalLibur_(tanggal, divisi, libur, noAbsen, status) {
  var p = String(tanggal || '').split('-').map(Number);
  if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return true;
  return absensiTanggalLibur_(tanggal, divisi, noAbsen, libur, status);   // Off produksi hanya berlaku untuk HL
}

/* Dukung field "jam" (schema baru) dan "nilai" (schema lama) */
function portalLemburJamHarian_(h, tanggal, divisi, libur, noAbsen, status) {
  h = h || {};
  var jenis = String(h.jenis || '').toLowerCase();
  if (jenis === 'kode' || jenis === 'hadir' || jenis === 'nonlembur') return 0;
  var raw = h.jam !== undefined ? h.jam : h.nilai;
  var n = Number(String(raw == null ? '' : raw).trim().replace(',', '.'));
  if (!isFinite(n) || n <= 0) return 0;
  var khususLibur = jenis === 'libur' || (!jenis && [8, 10, 12, 14].indexOf(n) >= 0);
  if (khususLibur && h.hariLibur !== true && String(h.hariLibur).toLowerCase() !== 'true' &&
      !portalTanggalLibur_(tanggal, divisi, libur, noAbsen, status)) return 0;
  return n;
}

function portalTarifEfektif_(noAbsen, divisi, tarifMap) {
  var global = tarifMap.global || { upahHarian: '', tarifLemburPerJam: '' };
  var div = tarifMap.divisi[String(divisi || '').trim().toLowerCase()] || {};
  var peg = tarifMap.pegawai[portalKunciIdentitasExact_(noAbsen)] || {};
  if (portalDivisiAktiva_(divisi)) {
    var terpasang = peg.upahHarian !== '' && peg.upahHarian != null;
    return { upahHarian: Number(terpasang ? peg.upahHarian : 0) || 0,
      tarifLemburPerJam: 0, upahHarianTerpasang: terpasang, tarifLemburTerpasang: true };
  }
  var sumberHarian = peg.upahHarian !== '' && peg.upahHarian != null ? peg.upahHarian
    : (div.upahHarian !== '' && div.upahHarian != null ? div.upahHarian : global.upahHarian);
  var sumberLembur = peg.tarifLemburPerJam !== '' && peg.tarifLemburPerJam != null ? peg.tarifLemburPerJam
    : (div.tarifLemburPerJam !== '' && div.tarifLemburPerJam != null ? div.tarifLemburPerJam : global.tarifLemburPerJam);
  return {
    upahHarian: Number(sumberHarian || 0) || 0,
    tarifLemburPerJam: Number(sumberLembur || 0) || 0,
    upahHarianTerpasang: sumberHarian !== '' && sumberHarian != null,
    tarifLemburTerpasang: sumberLembur !== '' && sumberLembur != null
  };
}

/* ---------- REKAPAN GAJI ---------- */
function portalRekapanHitungSimpan(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var simulasi = param.simulasi === true;
  var dari = normalTanggal_(param.dari), sampai = normalTanggal_(param.sampai);
  if (!dari || !sampai || dari > sampai) throw new Error('Pilih rentang tanggal yang valid.');
  var jarak = Math.round((Date.parse(sampai + 'T00:00:00Z') - Date.parse(dari + 'T00:00:00Z')) / 86400000);
  if (jarak > 366) throw new Error('Rentang perhitungan maksimal 367 hari.');

  var ss = ambilSheet_();
  var master = bacaKaryawan_(siap_()).filter(function (k) { return portalKunciIdentitasExact_(k.noAbsen); });
  bacaTenagaPenugasan_().forEach(function (x) { if (portalKunciIdentitasExact_(x.noAbsen)) master.push({ id:x.id, noAbsen:x.noAbsen, nama:x.nama, divisi:x.divisi||'', jabatan:x.jabatan||'', status:x.status||'HL', aktif:x.aktif, kategori:x.kategori, skemaHK:x.skemaHK, sumber:'tenaga_penugasan' }); });
  var absSh = ss.getSheetByName(ABS.TAB);
  var absRows = absSh && absSh.getLastRow() > 1 ? absSh.getRange(2, 1, absSh.getLastRow() - 1, ABS.HEADER.length).getDisplayValues() : [];
  var hadirByNo = Object.create(null), karyawanByNo = Object.create(null), noAbsenGanda = [];
  master.forEach(function (k) {
    var no = portalKunciIdentitasExact_(k.noAbsen);
    if (karyawanByNo[no]) noAbsenGanda.push(k.noAbsen);
    karyawanByNo[no] = k;
    hadirByNo[no] = Object.create(null);
  });
  if (noAbsenGanda.length) throw new Error('Nomor absen/ID karyawan ganda pada master: ' + noAbsenGanda.slice(0, 10).join(', ') + '.');

  var libur = produksiOffDaftar_().aturan || [];   // satu aturan: libur + Off produksi (semua divisi / pilihan divisi / karyawan)

  Object.keys(hadirByNo).forEach(function (no) { hadirByNo[no] = Object.create(null); });
  absRows.forEach(function (r) {
    var tgl = normalTanggal_(r[0]);
    var no = portalKunciIdentitasExact_(r[1]);
    var status = String(r[2] || '').trim().toLowerCase();
    if (!tgl || tgl < dari || tgl > sampai || !karyawanByNo[no] || (status !== 'hadir' && status !== 'dinas luar')) return;
    if (portalTanggalLibur_(tgl, karyawanByNo[no].divisi, libur, karyawanByNo[no].noAbsen, karyawanByNo[no].status)) return;
    hadirByNo[no][tgl] = true;
  });

  var tarifSh = portalTarifSheet_();
  portalTarifMigrasiGlobal_();
  var tarifRows = tarifSh.getLastRow() > 1 ? tarifSh.getRange(2, 1, tarifSh.getLastRow() - 1, TARIF.HEADER.length).getDisplayValues() : [];
  var tarifMap = { global: null, divisi: Object.create(null), pegawai: Object.create(null) };
  tarifRows.forEach(function (r) {
    if (r[6] === 'tidak') return;
    var x = { upahHarian: r[4], tarifLemburPerJam: r[5] };
    if (r[0] === 'global') tarifMap.global = x;
    else if (r[0] === 'divisi') tarifMap.divisi[String(r[1] || '').trim().toLowerCase()] = x;
    else if (r[0] === 'pegawai') tarifMap.pegawai[portalKunciIdentitasExact_(r[1])] = x;
  });

  var jamByNo = Object.create(null);
  [LBR.TAB, LBR.PENGAPALAN_TAB].forEach(function (namaSheetLembur) {
    var lemburSh = ss.getSheetByName(namaSheetLembur);
    if (!lemburSh || lemburSh.getLastRow() < 2) return;
    var header = lemburSh.getRange(1, 1, 1, lemburSh.getLastColumn()).getDisplayValues()[0].map(function (x) { return String(x || '').trim().toLowerCase(); });
    var vals = lemburSh.getRange(2, 1, lemburSh.getLastRow() - 1, lemburSh.getLastColumn()).getDisplayValues();
    function ix(n) { return header.indexOf(n); }
    var ixNo = ix('no_absen');
    var ixJson = ix('rincian_harian_json');
    var ixStatus = ix('status') >= 0 ? ix('status') : ix('status_persetujuan');

    vals.forEach(function (r) {
      if (ixStatus >= 0 && !/disetujui/i.test(r[ixStatus])) return;
      var no = portalKunciIdentitasExact_(r[ixNo]);
      var k = karyawanByNo[no];
      if (!k || portalDivisiAktiva_(k.divisi)) return;

      var daily = [];
      try { if (ixJson >= 0) daily = JSON.parse(r[ixJson] || '[]'); } catch (e) { daily = []; }
      if (!Array.isArray(daily)) daily = [];
      if (!daily.length) return;

      var total = 0;
      daily.forEach(function (d) {
        var tgl = normalTanggal_(d.tanggal);
        if (!tgl || tgl < dari || tgl > sampai) return;
        total += portalLemburJamHarian_(d, tgl, k.divisi, libur, k.noAbsen, k.status);
      });
      if (total > 0) jamByNo[no] = (jamByNo[no] || 0) + total;
    });
  });

  var runId = Utilities.getUuid(), now = sekarang_('yyyy-MM-dd HH:mm:ss');
  var output = [], tarifBelumDiatur = [];
  master.forEach(function (k) {
    var no = portalKunciIdentitasExact_(k.noAbsen);
    var statusKaryawan = String(k.status || '').trim();
    var divisiAktiva = portalDivisiAktiva_(k.divisi);
    // Aktiva Bangunan = semua HL ? gaji pokok SELALU dihitung, apapun status di master.
    // Status HT/KT hanya berlaku untuk divisi non-Aktiva Bangunan.
    var rental = k.sumber === 'tenaga_penugasan' && k.kategori === 'Rental';
    var tanpaGaji = rental ? String(k.skemaHK || '').toUpperCase() !== 'DIBAYAR' : (divisiAktiva ? false : portalStatusTanpaGajiHarian_(statusKaryawan));
    var hariHadir = Object.keys(hadirByNo[no] || {}).length;
    var jam = divisiAktiva ? 0 : (jamByNo[no] || 0);

    // Hitung hari yang benar-benar dibayar (0 untuk HT/KT)
    var hariDibayar = tanpaGaji ? 0 : hariHadir;

    // Skip kalau tidak ada yang perlu dibayar sama sekali
    if (hariDibayar === 0 && jam === 0) return;

    var rates = portalTarifEfektif_(k.noAbsen, k.divisi, tarifMap);

    // Validasi tarif: hanya butuh upah harian kalau memang dihitung gajinya
    if (!tanpaGaji && hariDibayar > 0 && !rates.upahHarianTerpasang) {
      var pesanTarif;
      if (divisiAktiva) {
        pesanTarif = (k.nama || k.noAbsen) + ' (' + k.noAbsen + '): Aktiva Bangunan wajib upah harian khusus per orang (tidak pakai tarif global/divisi)';
      } else {
        pesanTarif = (k.nama || k.noAbsen) + ' (' + k.noAbsen + '): upah harian';
      }
      tarifBelumDiatur.push(pesanTarif);
    }
    if (jam > 0 && !rates.tarifLemburTerpasang) {
      tarifBelumDiatur.push((k.nama || k.noAbsen) + ' (' + k.noAbsen + '): tarif lembur per jam');
    }

    var gaji = tanpaGaji ? 0 : Math.round(hariDibayar * rates.upahHarian);
    var nominalLembur = Math.round(jam * rates.tarifLemburPerJam);
    var total = gaji + nominalLembur;

    output.push({
      no_absen: k.noAbsen,
      nama: k.nama,
      divisi: k.divisi || '',
      status: statusKaryawan,
      tanpa_gaji_harian: tanpaGaji,
      hari_dibayar: hariDibayar,
      hari_hadir: hariHadir,                 // info referensi (HT/KT bisa hadir tapi tidak dibayar)
      upah_harian: tanpaGaji ? 0 : rates.upahHarian,
      nominal_gaji: gaji,
      jam_lembur: Number(jam.toFixed(2)),
      tarif_lembur_per_jam: rates.tarifLemburPerJam,
      nominal_lembur: nominalLembur,
      total_nominal: total
    });
  });

  if (tarifBelumDiatur.length && !simulasi) {
    throw new Error('Tarif belum lengkap: ' + tarifBelumDiatur.slice(0, 20).join('; ') +
      (tarifBelumDiatur.length > 20 ? '; dan lainnya' : '') + '. Lengkapi melalui Pengaturan Tarif.');
  }
  output.sort(function (a, b) {
    return String(a.divisi).localeCompare(String(b.divisi), 'id') || String(a.nama).localeCompare(String(b.nama), 'id');
  });

  if (!simulasi) {
    var simpan = portalRekapanGajiSheet_();
    if (output.length) {
      var values = output.map(function (x) {
        return [runId, dari, sampai, x.no_absen, x.nama, x.divisi,
          String(x.hari_dibayar), String(x.upah_harian), String(x.nominal_gaji),
          String(x.jam_lembur), String(x.tarif_lembur_per_jam), String(x.nominal_lembur),
          String(x.total_nominal), now];
      });
      simpan.getRange(simpan.getLastRow() + 1, 1, values.length, REKAP.HEADER.length).setNumberFormat('@').setValues(values);
    }
    catat_('admin', 'rekapan_gaji_hitung', 'periode=' + dari + '..' + sampai + '; karyawan=' + output.length + '; run=' + runId);
  }

  var pesanSukses = simulasi
    ? 'Preview rekapan berhasil dihitung.'
    : 'Rekapan berhasil dihitung dan disimpan sebagai snapshot.';
  if (tarifBelumDiatur.length) {
    pesanSukses += ' Peringatan: ' + tarifBelumDiatur.length + ' karyawan belum punya tarif lengkap.';
  }
  return { ok: true, idRun: simulasi ? '' : runId, dari: dari, sampai: sampai,
    dihitungPada: now, data: output, simulasi: simulasi,
    tarifBelum: tarifBelumDiatur, pesan: pesanSukses };
}

function portalRekapanRiwayatAmbil(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var sh = portalRekapanGajiSheet_(), last = sh.getLastRow();
  if (last < 2) return { ok: true, data: [] };
  var rows = sh.getRange(2, 1, last - 1, REKAP.HEADER.length).getDisplayValues();
  var run = String(param.idRun || '');
  var out = rows.filter(function (r) { return !run || r[0] === run; }).map(function (r) {
    return { id_run: r[0], periode_dari: r[1], periode_sampai: r[2], no_absen: r[3], nama: r[4],
      divisi: r[5], hari_dibayar: r[6], upah_harian: r[7], nominal_gaji: r[8], jam_lembur: r[9],
      tarif_lembur_per_jam: r[10], nominal_lembur: r[11], total_nominal: r[12], dihitung_pada: r[13] };
  });
  out.reverse();
  return { ok: true, data: out };
}

/* ---------- MAPPING LEMBUR ---------- */
function portalLemburMappingSheet_() {
  var ss = ambilSheet_();
  var sh = ss.getSheetByName(MAP_LBR.TAB);
  if (!sh) sh = buatTab_(ss, MAP_LBR.TAB, MAP_LBR.HEADER, []);
  return sh;
}

function portalLemburMappingAmbil(token) {
  wajibAdmin_(token);
  var sh = portalLemburMappingSheet_();
  var n = sh.getLastRow() - 1;
  if (n < 1) return { ok: true, data: [] };
  var rows = sh.getRange(2, 1, n, 4).getDisplayValues();
  return { ok: true, data: rows.filter(function (r) { return r[0] && r[1]; })
    .map(function (r) { return { namaExcel: r[0], noAbsen: r[1], namaMaster: r[2] }; }) };
}

function portalLemburMappingSimpan(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var namaExcel = String(param.namaExcel || '').trim();
  var noAbsen = String(param.noAbsen || '').trim();
  if (!namaExcel || !noAbsen) return { ok: false, pesan: 'Nama & No.Absen wajib.' };
  var master = bacaKaryawan_(siap_()).filter(function (k) { return String(k.noAbsen).trim() === noAbsen; });
  if (master.length !== 1) return { ok: false, pesan: 'Karyawan tidak ditemukan.' };
  return denganKunci_(function () {
    var sh = portalLemburMappingSheet_();
    var n = sh.getLastRow() - 1;
    var rows = n > 0 ? sh.getRange(2, 1, n, 4).getDisplayValues() : [];
    var key = namaExcel.toUpperCase(), target = -1;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === key) { target = i + 2; break; }
    }
    var vals = [namaExcel, noAbsen, master[0].nama || '', sekarang_('yyyy-MM-dd HH:mm:ss')];
    if (target > 0) sh.getRange(target, 1, 1, 4).setValues([vals]);
    else sh.getRange(sh.getLastRow() + 1, 1, 1, 4).setValues([vals]);
    return { ok: true };
  });
}

function portalLemburMappingHapus(token, param) {
  wajibAdmin_(token);
  param = param || {};
  var key = String(param.namaExcel || '').trim().toUpperCase();
  if (!key) return { ok: false, pesan: 'Nama wajib.' };
  return denganKunci_(function () {
    var sh = portalLemburMappingSheet_();
    var n = sh.getLastRow() - 1;
    if (n < 1) return { ok: false, pesan: 'Kosong.' };
    var rows = sh.getRange(2, 1, n, 1).getDisplayValues();
    for (var i = rows.length - 1; i >= 0; i--) {
      if (String(rows[i][0]).toUpperCase() === key) {
        sh.deleteRow(i + 2);
        return { ok: true };
      }
    }
    return { ok: false, pesan: 'Tidak ditemukan.' };
  });
}

function parseTanggalLemburAman_(v) {
  if (!v) return '';
  var s = String(v).trim();
  // 1. Jika ISO string dari frontend (mengandung 'T'), paksa +7 jam (WIB)
  if (s.indexOf('T') > 0) {
    var d = new Date(s);
    d.setTime(d.getTime() + (7 * 60 * 60 * 1000));
    return d.toISOString().slice(0, 10);
  }
  // 2. Jika format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // 3. Jika format DD-MM-YY (seperti di Excel Anda)
  var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    var thn = m[3].length === 2 ? '20' + m[3] : m[3];
    return thn + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  }
  return normalTanggal_(v);
}
