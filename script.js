/* PT Raja Palma - script */
	(function () {
	'use strict';
	var PORTAL = 'karyawan';
	var GAS_URL = "https://script.google.com/macros/s/AKfycbwfq5F4ysYs7H0fUxNrJ3A2fpwX0gTK87qa_HS9WMssTV0umNiLwr4zyXzC0gp-gpbG6Q/exec";
	var KT = 'hrd_token_' + PORTAL;
	var S = { token: null, peran: null, karyawan: null, hak: [], profilPromise: null };
	var NS = 'http://www.w3.org/2000/svg';
	var menuCloseTimer = null;
	var portalAnalyticsTimer = null;
	var portalAnalyticsSedangKirim = false;
	var pengendaliHalaman = null;
	var riwayatMenuSiap = false;
	var riwayatMenu = [];
	var indeksRiwayatMenu = -1;
	var batalkanTekanLamaAktif = function () {};
	var IKON = {
	beranda: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
	karyawan: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.6.3 4.5 2.2 4.5 5"/>',
	absensi: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M8.5 15l2.5 2.5 4.5-4.5"/>',
	administrasi: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5m8-5v5M7 13h4m2 0h4M7 16h4m2 0h4"/>',
	disiplin: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v5M12 16.5v.01"/>',
	sop: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
	lembur: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
	profil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.3-7 8-7s8 2.8 8 7"/>',
	rekapan: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h8"/>',
	akses: '<path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m8.5 12 2.3 2.3 4.8-5"/>',
	password: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/>',
	opsi: '<path d="M4 6h10M4 11h10M4 16h7M16 13l3 3 3-3"/>',
	garis: '<path d="M4 6h16M4 12h16M4 18h16"/>',
	kamera: '<path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z"/><circle cx="12" cy="13" r="3.5"/>'
	};

	var JUDUL_MODUL = { disiplin: 'Disiplin', sop: 'SOP', lembur: 'Lembur', rekapan: 'Rekapan' };
	var AKSI_MODUL = { disiplin: 'karyawanDisiplin', sop: 'karyawanSOP', lembur: 'karyawanLembur', rekapan: 'karyawanRekapan' };
	var TAB_MODUL = { disiplin: 'disiplin_karyawan', sop: 'sop_karyawan', lembur: 'lembur_karyawan', rekapan: 'rekapan_karyawan' };

	function $(id) { return document.getElementById(id); }
	function el(tag, props, kids) {
	var e = document.createElement(tag);
	if (props) Object.keys(props).forEach(function (k) {
		var v = props[k];
		if (v == null || v === false) return;
		if (k === 'text') e.textContent = v;
		else if (k === 'class') e.className = v;
		else if (k === 'value') e.value = v;
		else if (k === 'checked') e.checked = true;
		else if (k === 'on') Object.keys(v).forEach(function (ev) { e.addEventListener(ev, v[ev]); });
		else e.setAttribute(k, v === true ? '' : v);
	});
	(kids || []).forEach(function (c) {
		if (c == null) return;
		e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
	});
	return e;
	}
	function ikon(isi) {
	var s = document.createElementNS(NS, 'svg');
	s.setAttribute('viewBox', '0 0 24 24');
	s.setAttribute('aria-hidden', 'true');
	s.innerHTML = isi;
	return s;
	}
	function btn(teks, kelas, klik) {
	var b = el('button', { type: 'button', class: 'btn ' + (kelas || ''), text: teks });
	if (klik) b.addEventListener('click', klik);
	return b;
	}
	function fieldEl(label, input, bantuan) {
	return el('label', { class: 'field' }, [el('span', { text: label }), input, bantuan ? el('small', { class: 'sub2', text: bantuan }) : null]);
	}
	function halaman(judul, sub) {
	var isi = $('isi');
	isi.innerHTML = '';
	isi.appendChild(el('h2', { text: judul }));
	if (sub) isi.appendChild(el('p', { class: 'sub', text: sub }));
	return isi;
	}
	function panelEl(judul, kanan, kids) {
	var head = el('div', { class: 'head' }, [el('h3', { text: judul })]);
	if (kanan) head.appendChild(kanan);
	var p = el('section', { class: 'panel' }, [head]);
	(kids || []).forEach(function (k) { if (k) p.appendChild(k); });
	return p;
	}
	function tabel(headers, rows) {
	var thead = el('thead', null, [el('tr', null, headers.map(function (h) { return el('th', { text: h }); }))]);
	var tb = el('tbody');
	rows.forEach(function (r) {
		var tr = el('tr');
		r.forEach(function (c, i) {
		var td = el('td', { 'data-label': headers[i] || '' });
		if (c && c.nodeType) td.appendChild(c);
		else td.textContent = (c === '' || c == null) ? '—' : String(c);
		tr.appendChild(td);
		});
		tb.appendChild(tr);
	});
	return el('div', { class: 'tabelbungkus' }, [el('table', { class: 'tbl' }, [thead, tb])]);
	}
	function pesanError(e) { return String((e && e.message) || e).replace(/^Error:\s*/, ''); }
	function p2(n) { return ('0' + n).slice(-2); }
	function isoHari(d) { d = d || new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
/* ===== OFF PRODUKSI / MAINTENANCE / LIBUR (satu sumber kebenaran) ===== */
var OFF_STATE = { siap: false, gagal: false, ver: 0, aturan: [], divisiByNo: Object.create(null), hlByNo: null, promise: null };

function kunciNoAbsen(v) {
  return String(v == null ? '' : v).trim().toLowerCase().replace(/^0+(?=\d)/, '');
}

/* Muat jadwal Off dari server. paksa=true -> ambil ulang (dipakai tiap membuka Cek Absensi). */
function muatLiburProduksi(paksa) {
  if (OFF_STATE.promise && !paksa) return OFF_STATE.promise;
  var p = api('karyawanLiburProduksi').then(function (r) {
    OFF_STATE.aturan = Array.isArray(r && r.aturan) ? r.aturan : [];
    OFF_STATE.divisiByNo = (r && r.divisiByNo) || Object.create(null);
    OFF_STATE.hlByNo = (r && r.hlByNo) || null;   // peta karyawan HL; Off produksi hanya berlaku untuk HL
    OFF_STATE.siap = true; OFF_STATE.gagal = false; OFF_STATE.ver++;
    return OFF_STATE;
  }).catch(function (e) {
    OFF_STATE.promise = null;
    var m = pesanError(e);
    if (m === 'SESI_HABIS' || m === 'PERMINTAAN_DIBATALKAN') throw e;
    // Gagal memuat: tandai agar Alpha TIDAK dihitung (lebih aman daripada salah menuduh Alpha).
    OFF_STATE.siap = false; OFF_STATE.gagal = true; OFF_STATE.ver++;
    return OFF_STATE;
  });
  OFF_STATE.promise = p;
  return p;
}

function resetOffState() {
  OFF_STATE.siap = false; OFF_STATE.gagal = false; OFF_STATE.ver++;
  OFF_STATE.aturan = []; OFF_STATE.divisiByNo = Object.create(null); OFF_STATE.hlByNo = null; OFF_STATE.promise = null;
}

/* Hari OFF = HANYA Off produksi / maintenance (sheet pengaturan_produksi_off).
   Minggu / libur nasional / cuti bersama / Jumat Aktiva BUKAN OFF: harinya dikosongkan (lihat infoLiburRutin). */
/* Apakah aturan sheet (pengaturan_produksi_off) berlaku untuk karyawan ini. '*' = semua divisi. */
function aturanOffKena(o, div, no) {
  if (o.cakupan === 'pegawai') {
    return !!no && (o.noAbsen || []).some(function (n) { return kunciNoAbsen(n) === no; });
  }
  return (o.divisi || []).some(function (d) {
    d = String(d || '').trim().toLowerCase();
    return d === '*' || (!!div && d === div);
  });
}
function infoHariOff(tgl, k) {
  tgl = String(tgl || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return null;
  k = k || {};
  var div = String(k.divisi || '').trim().toLowerCase();
  var no = kunciNoAbsen(k.noAbsen);
  var daftar = OFF_STATE.aturan || [];
  for (var i = 0; i < daftar.length; i++) {
    var o = daftar[i];
    if (!o || o.tanggal !== tgl || o.jenis === 'libur') continue;   // jenis 'libur' dikosongkan, bukan OFF
    if (OFF_STATE.hlByNo && !OFF_STATE.hlByNo[no]) continue;        // Off produksi hanya untuk karyawan HL
    if (aturanOffKena(o, div, no)) {
      var alasan = String(o.alasan || '').trim();
      return { jenis: 'produksi', ket: (alasan && alasan.toLowerCase() !== 'off') ? 'Off produksi \u2014 ' + alasan : 'Off produksi' };
    }
  }
  return null;
}

/* Libur rutin: libur nasional, cuti bersama, libur mingguan (Aktiva Bangunan: Jumat; divisi lain: Minggu).
   Hanya dipakai untuk MENGOSONGKAN hari tsb (tanpa baris OFF dan tanpa Alpha). Sama dengan backend absensiTanggalLibur_. */
function infoLiburRutin(tgl, k) {
  tgl = String(tgl || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return null;
  var div = String((k && k.divisi) || '').trim().toLowerCase();
  var no = kunciNoAbsen(k && k.noAbsen);
  var tambahan = (OFF_STATE.aturan || []).filter(function (o) { return o && o.tanggal === tgl && o.jenis === 'libur' && aturanOffKena(o, div, no); })[0];
  if (tambahan) return { jenis: 'libur', ket: 'Libur: ' + (String(tambahan.alasan || '').trim() || 'libur perusahaan') };
  if (LIBUR_NASIONAL[tgl]) return { jenis: 'nasional', ket: 'Libur nasional: ' + LIBUR_NASIONAL[tgl] };
  if (CUTI_BERSAMA[tgl]) return { jenis: 'cuti', ket: CUTI_BERSAMA[tgl] };
  var d0 = new Date(tgl + 'T00:00:00');
  if (isNaN(d0)) return null;
  var hari = d0.getDay();
  if (div === 'aktiva bangunan' ? hari === 5 : hari === 0) {
    return { jenis: 'mingguan', ket: hari === 5 ? 'Libur mingguan (Jumat)' : 'Libur mingguan (Minggu)' };
  }
  return null;
}

/* Ringkasan aturan Off produksi pada satu tanggal (sudah difilter server sesuai hak akses). */
function ringkasOffProduksi(tgl) {
  return (OFF_STATE.aturan || []).filter(function (o) { return o && o.tanggal === tgl; }).map(function (o) {
    var cakup = o.cakupan === 'pegawai' ? ((o.noAbsen || []).length + ' karyawan') : ((o.divisi || []).map(function (d) { return d === '*' ? 'Semua divisi' : d; }).join(', ') || 'divisi');
    return (o.alasan || 'Off') + ' — ' + cakup;
  });
}
	function dmy(iso) { return iso ? String(iso).split('-').reverse().join('/') : ''; }
	function karyawanNonaktifPabrik(r) {
	r = r || {};
	var v = r.aktif;
	if (typeof v === 'boolean') return v === false;
	if (typeof v === 'number') return v === 0;
	var n = String(v == null ? '' : v).trim().toLowerCase().replace(/[ _-]+/g, ' ');
	if (['false', '0', 'nonaktif', 'tidak aktif', 'non active', 'inactive', 'no', 'tidak', 'off'].indexOf(n) >= 0) return true;
	if (['true', '1', 'aktif', 'active', 'ya', 'yes', 'on'].indexOf(n) >= 0) return false;
	// Fallback untuk data lama yang belum mengirim kolom aktif, tetapi punya tanggal nonaktif.
	return !n && !!String(r.tglNonaktif || '').trim();
	}
	function lamaKerja(dari, sampai) {
	if (!dari) return '';
	var a = new Date(dari + 'T00:00:00'), b = sampai ? new Date(sampai + 'T00:00:00') : new Date();
	if (isNaN(a) || b < a) return '';
	var bln = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
	if (b.getDate() < a.getDate()) bln--;
	if (bln < 0) bln = 0;
	var th = Math.floor(bln / 12);
	return (th ? th + ' tahun ' : '') + (bln % 12) + ' bulan';
	}
	function simpanToken(t) { try { if (t) sessionStorage.setItem(KT, t); else sessionStorage.removeItem(KT); } catch (e) {} }
	function bacaToken() { try { return sessionStorage.getItem(KT); } catch (e) { return null; } }
	var timerOptimasiTema = null;
	function aturTema(gelap) {
	var tema = gelap ? 'dark' : 'light';
	var root = document.documentElement;
	var rootStyle = root.style;
	var diPonsel = window.matchMedia && window.matchMedia('(max-width: 800px)').matches;
	if (diPonsel) {
		root.classList.add('theme-switching');
		clearTimeout(timerOptimasiTema);
		timerOptimasiTema = setTimeout(function(){ root.classList.remove('theme-switching'); }, 190);
	}
	root.setAttribute('data-theme', tema);
	['bg', 'paper', 'side', 'hd', 'ac', 'ac2', 'mut'].forEach(function (k) {
		rootStyle.removeProperty('--' + k);
	});
	if (!gelap) {
		// Terapkan variabel palet langsung; tidak perlu memindai/update seluruh panel UI.
		var palet = 'cream', latar = '';
		try {
		palet = localStorage.getItem('hrd_palett') || 'cream';
		latar = localStorage.getItem('hrd_latar_custom') || '';
		} catch (e) {}
		var warna = (typeof PALET_TEMA !== 'undefined' && PALET_TEMA[palet]) || (typeof PALET_TEMA !== 'undefined' && PALET_TEMA.cream) || null;
		if (warna) {
		['bg', 'paper', 'side', 'hd', 'ac', 'ac2', 'mut'].forEach(function(k){ rootStyle.setProperty('--' + k, warna[k]); });
		if (latar) rootStyle.setProperty('--bg', latar);
		}
	}
	var label = gelap ? 'Aktifkan mode terang' : 'Aktifkan mode gelap';
	['themeToggle', 'loginThemeToggle'].forEach(function(id) {
		var tombol = $(id);
		if (!tombol) return;
		tombol.innerHTML = '';
		var gambar = ikon(gelap
		? '<path d="M20.985 12.486A9 9 0 1 1 11.514 3.015a7 7 0 0 0 9.471 9.471Z"/><path d="m19 2 .7 2.3L22 5l-2.3.7L19 8l-.7-2.3L16 5l2.3-.7L19 2Z"/>'
		: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>');
		gambar.classList.add('ikon-tema');
		tombol.appendChild(gambar);
		tombol.setAttribute('aria-label', label);
		tombol.title = label;
	});
	try { localStorage.setItem('hrd_tema', tema); } catch (e) {}
	}

	var TOAST_META = {
	success: { judul: 'Berhasil', ikon: '<path d="M20 6 9 17l-5-5"/>' },
	error: { judul: 'Gagal', ikon: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>' },
	warning: { judul: 'Perhatian', ikon: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17v.01"/>' },
	info: { judul: 'Informasi', ikon: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>' }
	};
	function tutupToast(t) {
	if (!t || !t.parentNode || t.classList.contains('out')) return;
	t.classList.add('out');
	setTimeout(function () { if (t.parentNode) t.remove(); }, 230);
	}
	function toast(teks, jenis) {
	var pesan = String(teks == null ? '' : teks);
	if (pesan === 'PERMINTAAN_DIBATALKAN') return;
	var tipe = jenis || (/gagal|error|tidak dapat|tidak bisa|invalid|exception|bermasalah|ditolak|belum berhasil/i.test(pesan) ? 'error' : (/peringatan|periksa|pastikan|minimal|harus|belum lengkap|tidak ditemukan|kosong|terlebih dahulu|tidak diizinkan|izinkan/i.test(pesan) ? 'warning' : (/berhasil|tersimpan|disimpan|diperbarui|dihapus|selesai|sukses|diimpor|diekspor|terbuat|diaktifkan|dinonaktifkan|terkirim|diubah|diajukan/i.test(pesan) ? 'success' : 'info')));
	var meta = TOAST_META[tipe];
	var stack = $('toastStack');
	if (!stack) { stack = el('div', { id: 'toastStack' }); document.body.appendChild(stack); }
	while (stack.children.length >= 4) stack.firstChild.remove();
	var dur = tipe === 'error' ? 8 : 5;
	var bar = el('div', { class: 'toast-bar', style: 'animation-duration:' + dur + 's' });
	var tutup = el('button', { type: 'button', class: 'toast-close', 'aria-label': 'Tutup notifikasi' }, [ikon('<path d="M6 6l12 12M18 6 6 18"/>')]);
	var t = el('div', { class: 'toast toast-' + tipe, role: tipe === 'error' ? 'alert' : 'status' }, [
		el('div', { class: 'toast-ico', 'aria-hidden': 'true' }, [ikon(meta.ikon)]),
		el('div', { class: 'toast-body' }, [el('strong', { class: 'toast-title', text: meta.judul }), el('p', { class: 'toast-msg', text: pesan })]),
		tutup, bar
	]);
	tutup.addEventListener('click', function () { tutupToast(t); });
	bar.addEventListener('animationend', function () { tutupToast(t); });
	setTimeout(function () { if (t.parentNode && getComputedStyle(bar).animationName === 'none') tutupToast(t); }, dur * 1000);
	stack.appendChild(t);
	}

	function pasangPerlindunganInteraksi() {
	var notifikasiTerakhir = 0;
	var tekanTimer = null;
	var titikTekan = null;

	function bisaDiedit(target) {
		return !!(target && target.closest && target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]'));
	}
	function beriPeringatan(pesan) {
		var sekarang = Date.now();
		if (sekarang - notifikasiTerakhir < 1200) return;
		notifikasiTerakhir = sekarang;
		toast(pesan, 'warning');
	}
	function batalkanTekanLama() {
		clearTimeout(tekanTimer);
		tekanTimer = null;
		titikTekan = null;
	}
	batalkanTekanLamaAktif = batalkanTekanLama;

	document.addEventListener('contextmenu', function (e) {
		if (bisaDiedit(e.target)) return;
		e.preventDefault();
		beriPeringatan('Klik kanan dinonaktifkan demi menjaga keamanan halaman.');
	});
	document.addEventListener('selectstart', function (e) {
		if (bisaDiedit(e.target)) return;
		e.preventDefault();
		beriPeringatan('Teks halaman ini tidak dapat diblok atau disalin.');
	});
	document.addEventListener('touchstart', function (e) {
		if (e.touches.length !== 1 || bisaDiedit(e.target) || (e.target.closest && e.target.closest('button, a'))) {
		batalkanTekanLama();
		return;
		}
		var sentuhan = e.touches[0];
		titikTekan = { x: sentuhan.clientX, y: sentuhan.clientY };
		clearTimeout(tekanTimer);
		tekanTimer = setTimeout(function () {
		beriPeringatan('Tekan lama dinonaktifkan pada halaman ini.');
		batalkanTekanLama();
		}, 600);
	}, { passive: true });
	document.addEventListener('touchmove', function (e) {
		if (!titikTekan || !e.touches.length) return;
		var sentuhan = e.touches[0];
		if (Math.abs(sentuhan.clientX - titikTekan.x) > 12 || Math.abs(sentuhan.clientY - titikTekan.y) > 12) batalkanTekanLama();
	}, { passive: true });
	document.addEventListener('touchend', batalkanTekanLama, { passive: true });
	document.addEventListener('touchcancel', batalkanTekanLama, { passive: true });
	}

	function bukaModal(judul, isi, tombol, onClose) {
	var overlay = el('div', { class: 'overlay' }), tutup;
	function esk(e) { if (e.key === 'Escape') tutup(); }
	tutup = function () {
		if (!overlay.parentNode) return;
		overlay.remove();
		document.removeEventListener('keydown', esk);
		if (onClose) onClose();
	};
	var foot = el('div', { class: 'mf' }), tombolTutup = [];
	(tombol || []).forEach(function (t) {
		var b = el('button', { type: 'button', class: 'btn ' + (t.kelas || ''), text: t.teks });
		b.addEventListener('click', function () { t.klik(tutup, b); });
		if (String(t.teks || '').trim().toLowerCase() === 'tutup') tombolTutup.push(b);
		else foot.appendChild(b);
	});
	tombolTutup.forEach(function (b) { foot.appendChild(b); });
	var box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': judul }, [
		el('div', { class: 'mh' }, [el('h3', { text: judul })]),
		el('div', { class: 'mb' }, isi),
		foot
	]);
	overlay.appendChild(box);
	document.body.appendChild(overlay);
	document.addEventListener('keydown', esk);
	var f = box.querySelector('input,select,textarea'); if (f) f.focus();
	return { tutup: tutup, box: box, foot: foot };
	}
	function konfirmasi(judul, teks, labelYa, bahaya) {
	return new Promise(function (selesai) {
		var ya = false;
		bukaModal(judul, [el('p', { text: teks })], [
		{ teks: 'Batal', klik: function (t) { t(); } },
		{ teks: labelYa, kelas: bahaya ? 'bahaya' : 'primary', klik: function (t) { ya = true; t(); } }
		], function () { selesai(ya); });
	});
	}
	function tutupMenu() {
	document.querySelectorAll('.menu-pop').forEach(function (m) { m.classList.add('hidden'); });
	document.querySelectorAll('.menu-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
	}
	function posisikanMenuProfil() {
	var tombol = $('profilToggle'), menu = $('profilMenu');
	if (!tombol || !menu || menu.classList.contains('hidden')) return;
	var batas = 12, rect = tombol.getBoundingClientRect();
	var lebar = menu.offsetWidth, tinggi = menu.offsetHeight;
	var vw = document.documentElement.clientWidth, vh = window.innerHeight;
	var kiri = Math.max(batas, Math.min(vw - lebar - batas, rect.left + (rect.width - lebar) / 2));
	var atas = rect.bottom + 8;
	if (atas + tinggi > vh - batas) atas = rect.top - tinggi - 8;
	atas = Math.max(batas, Math.min(vh - tinggi - batas, atas));
	menu.style.left = kiri + 'px';
	menu.style.top = atas + 'px';
	}

	function fileGambarValid(file) {
	if (!file) return false;
	var ext = String(file.name || '').match(/\.([^.]+)$/), ekstensi = ext && /^(jpe?g|png|webp|gif)$/i.test(ext[1]);
	var mime = !file.type || /^image\/(jpeg|png|webp|gif)$/i.test(file.type);
	return !!ekstensi && mime;
	}
	function kompresFoto(file, cap, maks) {
	return new Promise(function (ok, gagal) {
		if (!file) { ok(null); return; }
		var url = URL.createObjectURL(file), img = new Image();
		img.onerror = function () { URL.revokeObjectURL(url); gagal(new Error('File tidak dapat dibaca sebagai gambar.')); };
		img.onload = function () {
		var sk = Math.min(1, (maks || 1400) / Math.max(img.naturalWidth, img.naturalHeight));
		var cv = document.createElement('canvas');
		cv.width = Math.max(1, Math.round(img.naturalWidth * sk));
		cv.height = Math.max(1, Math.round(img.naturalHeight * sk));
		var cx = cv.getContext('2d');
		cx.drawImage(img, 0, 0, cv.width, cv.height);
		if (cap) {
			var fs = Math.max(14, Math.round(cv.width * .022)), pad = 12;
			cx.font = 'bold ' + fs + 'px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
			cx.fillStyle = 'rgba(0,0,0,.68)';
			cx.fillRect(0, cv.height - fs - pad * 1.5, cv.width, fs + pad * 1.5);
			cx.fillStyle = '#fff';
			cx.fillText('PT RAJA PALMA | ' + cap, pad, cv.height - pad);
		}
		URL.revokeObjectURL(url);
		ok({ nama: file.name.replace(/\.[^.]+$/, '') + '.jpg', mimeType: 'image/jpeg', data: cv.toDataURL('image/jpeg', .78) });
		};
		img.src = url;
	});
	}
	function kartuPilihanAbsensi(judul, deskripsi, jenis, ikonIsi, aksi) {
	var kartu = el('button', { type: 'button', class: 'abs-home-card ' + jenis, 'aria-label': judul });
	kartu.appendChild(el('span', { class: 'abs-home-icon' }, [ikon(ikonIsi)]));
	kartu.appendChild(el('strong', { text: judul }));
	kartu.appendChild(el('span', { class: 'abs-home-desc', text: deskripsi }));
	kartu.appendChild(el('span', { class: 'abs-home-cta' }, [el('span', { text: 'Buka modul' }), ikon('<path d="M5 12h14M13 6l6 6-6 6"/>')]));
	kartu.addEventListener('click', aksi);
	return kartu;
	}

	async function panggil(aksi, param) {
	var res, pengendali = pengendaliHalaman;
	try {
		var opsi = {
		method: 'POST',
		redirect: 'follow',
		headers: { 'Content-Type': 'text/plain;charset=utf-8' },
		body: JSON.stringify({ aksi: aksi, token: S.token, param: param || {} })
		};
		if (pengendali) opsi.signal = pengendali.signal;
		var r = await fetch(GAS_URL, opsi);
		res = await r.json();
		if (pengendali && pengendali.signal.aborted) throw new Error('PERMINTAAN_DIBATALKAN');
	} catch (e) {
		if ((pengendali && pengendali.signal.aborted) || (e && e.message === 'PERMINTAAN_DIBATALKAN')) {
		throw new Error('PERMINTAAN_DIBATALKAN');
		}
		throw new Error('Gagal terhubung ke server.');
	}
	if (res && res.pesan === 'SESI_HABIS') { sesiHabis(); throw new Error('SESI_HABIS'); }
	return res;
	}
	async function api(aksi, param) {
	var res = await panggil(aksi, param);
	if (!res || !res.ok) throw new Error((res && res.pesan) || 'Permintaan gagal.');
	return res;
	}

	/* Daftar divisi: sumber sama dengan Portal Admin (aksi portalDivisiDaftar). */
	var divisiPortal = [];
	async function muatDivisiPortal() {
	try {
		var r = await api('portalDivisiDaftar');
		var baru = Array.from(new Set((r.divisi || []).map(function (d) {
		return String(typeof d === 'object' && d ? (d.divisi || d.nama || '') : d || '').trim();
		}).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, 'id', { sensitivity: 'base' }); });
		if (baru.length) divisiPortal = baru;
	} catch (e) {
		if (pesanError(e) === 'SESI_HABIS') throw e;
	}
	return divisiPortal;
	}

	function kirimHeartbeatPortal() {
	if (PORTAL !== 'karyawan' || !S.token || portalAnalyticsSedangKirim) return;
	portalAnalyticsSedangKirim = true;
	panggil('portalAnalyticsPing').catch(function () {}).finally(function () {
		portalAnalyticsSedangKirim = false;
	});
	}
	function mulaiHeartbeatPortal() {
	if (PORTAL !== 'karyawan' || !S.token) return;
	clearInterval(portalAnalyticsTimer);
	kirimHeartbeatPortal();
	portalAnalyticsTimer = setInterval(kirimHeartbeatPortal, 60000);
	}
	function hentikanHeartbeatPortal() {
	clearInterval(portalAnalyticsTimer);
	portalAnalyticsTimer = null;
	portalAnalyticsSedangKirim = false;
	}
	document.addEventListener('visibilitychange', function () {
	if (!document.hidden) kirimHeartbeatPortal();
	});

	function peranCocok(p) { return PORTAL === 'admin' ? p === 'admin' : p !== 'admin'; }
	function cabutToken(t) {
	if (t) fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ aksi: 'keluar', token: t, param: {} }) }).catch(function () {});
	}
	function tampilPesan(t) { var p = $('pesan'); p.textContent = t || ''; p.classList.toggle('hidden', !t); }

	async function masuk() {
	var req = ambilLogin();
	if (!req) return;
	var b = $('masuk');
	tampilPesan('');
	b.disabled = true; b.textContent = 'Memeriksa';
	try {
		var res = await panggil(req.aksi, req.param);
		if (!res || !res.ok) throw new Error((res && res.pesan) || 'Login gagal.');
		if (!peranCocok(res.peran)) {
		cabutToken(res.token);
		throw new Error(PORTAL === 'admin' ? 'Akun ini bukan admin. Gunakan Portal Karyawan.' : 'Akun admin tidak dapat masuk di sini. Gunakan Portal Admin.');
		}
		S.token = res.token; S.peran = res.peran; S.karyawan = res.karyawan || null; S.hak = res.hakAkses || [];
		simpanToken(S.token);
		bersihLogin();
		bukaAplikasi();
		mulaiHeartbeatPortal();
	} catch (e) {
		tampilPesan(pesanError(e));
	} finally {
		b.disabled = false; b.textContent = 'Masuk ke Portal';
	}
	}

	function bersihkanTampilan() {
	$('isi').innerHTML = ''; $('menu').innerHTML = '';
	document.querySelectorAll('.overlay').forEach(function (o) { o.remove(); });
	var ts = $('toastStack'); if (ts) ts.innerHTML = '';
	$('app').classList.add('hidden'); $('login').classList.remove('hidden');
	}
	function resetSesi() {
	hentikanHeartbeatPortal();
	if (pengendaliHalaman) pengendaliHalaman.abort();
	pengendaliHalaman = null;
	batalkanTekanLamaAktif();
	S.profilPromise = null; S.token = null; S.peran = null; S.karyawan = null; S.hak = []; simpanToken(null);
	resetOffState();
	}
	function sesiHabis() { resetSesi(); bersihkanTampilan(); tampilPesan('Sesi habis. Silakan login lagi.'); }
	function keluar() { var t = S.token; resetSesi(); bersihkanTampilan(); tampilPesan(''); cabutToken(t); }

	function jadwalkanTutupMenu() {
	clearTimeout(menuCloseTimer);
	if (!$('app').classList.contains('nav-open') || !window.matchMedia('(min-width: 801px)').matches) return;
	menuCloseTimer = setTimeout(function () {
		if (window.matchMedia('(min-width: 801px)').matches) aturMenu(false);
	}, 5000);
	}
	function aturMenu(buka) {
	clearTimeout(menuCloseTimer);
	$('app').classList.toggle('nav-open', buka);
	var tombol = $('menuToggle');
	if (tombol) {
		tombol.setAttribute('aria-expanded', String(buka));
		tombol.setAttribute('aria-label', buka ? 'Tutup menu navigasi' : 'Buka menu navigasi');
		tombol.title = buka ? 'Tutup menu navigasi' : 'Buka menu navigasi';
	}
	if (buka) jadwalkanTutupMenu();
	}
	function bukaAplikasi() {
	var admin = PORTAL === 'admin';
	$('login').classList.add('hidden'); $('app').classList.remove('hidden');
	$('app').classList.toggle('emp', !admin);
		$('peran').textContent = labelPeran();
	if (admin) tampilkanFotoProfil('');
	else muatFotoProfilHeader();
	var menu = $('menu'); menu.innerHTML = '';
	var daftar = daftarMenu();
	daftar.forEach(function (m, i) {
		var b = el('button', { type: 'button', class: 'nav', 'data-id': m.id, title: m.n });
		b.style.animationDelay = (80 + i * 45) + 'ms';
		var ik = el('span', { class: 'ik' });
		ik.appendChild(ikon(!admin && m.id === 'absensi' ? IKON.kamera : (IKON[m.id] || IKON.administrasi)));
		b.appendChild(ik);
		b.appendChild(el('span', { class: 'tk' }, [el('span', { text: m.n }), el('small', { text: m.k })]));
		b.addEventListener('click', function () { pilih(m.id); });
		menu.appendChild(b);
	});
	$('app').classList.remove('nav-open');
	aturMenu(false);
	siapkanRiwayatMenu(halamanAwal(daftar));
	pilih(halamanAwal(daftar), true);
	}

	function sel(v, key) { return String(v == null ? '' : v); }
	function renderModulData(id) {
	var admin = PORTAL === 'admin';
	var isi = halaman(JUDUL_MODUL[id], admin
		? 'Tampilan lihat-saja. Data diisi HRD langsung pada tab spreadsheet "' + TAB_MODUL[id] + '".'
		: 'Data yang ditampilkan mengikuti hak akses akun Anda.');
	var kotak = el('div', { class: 'info loading', text: 'Memuat data' });
	isi.appendChild(kotak);

	var bisaTambah = !admin && bolehTambah(id);
	var bisaEdit = !admin && bolehEdit(id);
	var bisaHapus = !admin && bolehHapus(id);
	var bisaAksi = bisaEdit || bisaHapus;

	if (bisaTambah) {
		isi.appendChild(el('div', { class: 'toolbar' }, [
		btn('+ Tambah data', 'primary', function () { formModul(id, null, muat); })
		]));
	}

	async function muat() {
		kotak.className = 'info loading'; kotak.textContent = 'Memuat data';
		try {
		var r = await api(AKSI_MODUL[id]);
		kotak.remove();
		var sendiri = !admin && hakDari(id).cakupan !== 'semua' && id !== 'sop';

		function bangun(rows, judulTabel, tampilkanAksi) {
			var keys = Object.keys(rows[0]).filter(function (k) {
			if (k.charAt(0) === '_') return false;
			if (sendiri && k === 'no_absen') return false;
			return true;
			});

			var headers = keys.map(function (k) { return k.replace(/_/g, ' '); });
			if (tampilkanAksi && bisaAksi) headers.push('Aksi');

			var thead = el('thead', null, [el('tr', null, headers.map(function (h) { return el('th', { text: h }); }))]);
			var tbody = el('tbody');

			rows.forEach(function (row) {
			var tr = el('tr');
			keys.forEach(function (k) {
				var td = el('td', { 'data-label': k.replace(/_/g, ' ') });
				var v = row[k];
				td.textContent = (v === '' || v == null) ? '?' : String(v);
				tr.appendChild(td);
			});
			if (tampilkanAksi && bisaAksi) {
				var tdAksi = el('td', { 'data-label': 'Aksi' });
				var wrap = el('div', { class: 'baris-aksi' });
				if (bisaEdit) {
				wrap.appendChild(btn('Edit', 'kecil', function () { formModul(id, row, muat); }));
				}
				if (bisaHapus) {
				wrap.appendChild(btn('Hapus', 'kecil bahaya', async function () {
					var okHapus = await konfirmasi('Hapus data?',
					'Data pada baris ini akan dihapus permanen. Lanjutkan?', 'Hapus', true);
					if (!okHapus) return;
					try {
					var res = await api('karyawanModulHapus', { menu: id, row: row._row });
					toast(res.pesan || 'Data dihapus.');
					muat();
					} catch (e) { toast(pesanError(e)); }
				}));
				}
				tdAksi.appendChild(wrap);
				tr.appendChild(tdAksi);
			}
			tbody.appendChild(tr);
			});

			var tabelEl = el('div', { class: 'tabelbungkus' }, [el('table', { class: 'tbl' }, [thead, tbody])]);
			if (!judulTabel) return tabelEl;
			return el('div', null, [el('h3', { class: 'sec', text: judulTabel, style: 'margin-top:18px' }), tabelEl]);
		}

		var ada = false;
		if (r.data && r.data.length) {
			isi.appendChild(bangun(r.data, id === 'rekapan' ? 'Rekap kerja' : '', true));
			ada = true;
		}
		if (id === 'rekapan' && r.slip && r.slip.length) {
			isi.appendChild(bangun(r.slip, 'Slip gaji', false));
			ada = true;
		}
		if (!ada) {
			isi.appendChild(el('div', { class: 'info', text: 'Belum ada data yang tersedia untuk modul ini.' }));
		}
		} catch (e) {
		if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') {
			kotak.className = 'alert';
			kotak.textContent = pesanError(e);
		}
		}
	}

	muat();
	}
	/* ============================================================
	LEMBUR — Matriks read-only (tampilan sama dengan portal admin)
	Data dari endpoint karyawanLembur (sudah difilter hak akses
	oleh backend Modul.gs). Frontend hanya merapikan jadi matriks.
	============================================================ */
	function renderLemburKaryawan() {
	var isi = halaman('Lembur', 'Rekap jam lembur per karyawan.');
	var kotak = el('div', { class: 'info loading', text: 'Memuat data lembur' });
	isi.appendChild(kotak);
	var semuaAkses = hakDari('lembur').cakupan === 'semua';

	Promise.all([api('karyawanLembur'), muatDivisiPortal()]).then(function (hasilMuat) {
		var r = hasilMuat[0];
		kotak.remove();
		var data = (r && r.data) || [];
		function tanggalLemburISO(nilai) {
			if (!nilai) return '';
			if (nilai instanceof Date && !isNaN(nilai.getTime())) return isoHari(nilai);
			var teks = String(nilai).trim();
			var iso = teks.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
			if (iso) return iso[1] + '-' + p2(iso[2]) + '-' + p2(iso[3]);
			var lokal = teks.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
			if (lokal) return lokal[3] + '-' + p2(lokal[2]) + '-' + p2(lokal[1]);
			return '';
		}
		var dataSiap = data.map(function (item) {
		return {
			item: item,
			rincian: (item.rincian_harian || []).map(function (rincian) {
			return { data: rincian, tanggal: tanggalLemburISO(rincian.tanggal), jam: Number(rincian.jam) || 0 };
			}).filter(function (rincian) { return !!rincian.tanggal; })
		};
		});
		var cariNama = semuaAkses ? el('input', { type: 'search', placeholder: 'Cari nama karyawan…', 'aria-label': 'Filter nama karyawan' }) : null;
		var pilihDivisi = semuaAkses ? el('select', { 'aria-label': 'Filter divisi' }) : null;
		var tanggalDari = el('input', { type: 'date', 'aria-label': 'Filter dari tanggal' });
		var tanggalSampai = el('input', { type: 'date', 'aria-label': 'Filter sampai tanggal' });
		var tanggalAkhirAwal = new Date();
		var tanggalMulaiAwal = new Date(tanggalAkhirAwal);
		tanggalMulaiAwal.setDate(tanggalMulaiAwal.getDate() - 13);
		tanggalDari.value = isoHari(tanggalMulaiAwal);
		tanggalSampai.value = isoHari(tanggalAkhirAwal);
		var filterDari = fieldEl('Dari tanggal', tanggalDari);
		var filterSampai = fieldEl('Sampai tanggal', tanggalSampai);
		filterDari.classList.add('lembur-date-filter');
		filterSampai.classList.add('lembur-date-filter');
		var hasil = el('div', { class: 'lembur-results' });
		var hitung = el('p', { class: 'hitung lembur-count', 'aria-live': 'polite' });
		var kontrol = [filterDari, filterSampai];
		if (semuaAkses) {
		pilihDivisi.appendChild(el('option', { value: '', text: 'Semua divisi' }));
		/* Samakan dengan Portal Admin; jika gagal dimuat, pakai divisi dari data lembur. */
		(divisiPortal.length ? divisiPortal : Array.from(new Set(data.map(function (item) { return String(item.divisi || '').trim(); }).filter(Boolean)))
			.sort(function (a, b) { return a.localeCompare(b, 'id', { sensitivity: 'base' }); }))
			.forEach(function (divisi) { pilihDivisi.appendChild(el('option', { value: divisi, text: divisi })); });
		kontrol.push(fieldEl('Cari nama', cariNama), fieldEl('Divisi', pilihDivisi));
		}
		var resetFilter = btn('Bersihkan filter', 'kecil lembur-reset', function () {
		tanggalDari.value = ''; tanggalSampai.value = '';
		if (cariNama) cariNama.value = '';
		if (pilihDivisi) pilihDivisi.value = '';
		tampilkanHasil();
		});
		kontrol.push(resetFilter);
		var panelFilter = el('section', { class: 'lembur-filter-panel', 'aria-label': 'Filter data lembur' }, [
		el('h3', { class: 'sec', text: 'Filter lembur' }),
		el('div', { class: 'toolbar lembur-filter' }, kontrol)
		]);
		var tampilan = el('section', { class: 'lembur-view', 'aria-label': 'Ringkasan lembur' }, [
		panelFilter,
		hitung,
		el('h3', { class: 'sec', text: 'Ringkasan lembur' }),
		hasil
		]);
		isi.appendChild(tampilan);

		function tampilkanHasil() {
		resetFilter.disabled = !tanggalDari.value && !tanggalSampai.value
			&& !(cariNama && cariNama.value.trim()) && !(pilihDivisi && pilihDivisi.value);
		var q = cariNama ? cariNama.value.trim().toLocaleLowerCase('id') : '';
		var divisiDipilih = pilihDivisi ? pilihDivisi.value : '';
		var dari = tanggalDari.value;
		var sampai = tanggalSampai.value;
		hasil.innerHTML = '';
		if (dari && sampai && dari > sampai) {
			hitung.textContent = 'Rentang tanggal belum valid.';
			hasil.appendChild(el('div', { class: 'alert', role: 'alert', text: 'Tanggal “Dari” harus sama dengan atau lebih awal daripada tanggal “Sampai”.' }));
			return;
		}
		var tersaring = dataSiap.filter(function (siap) {
			var item = siap.item;
			var namaCocok = !q || String(item.nama || '').toLocaleLowerCase('id').indexOf(q) >= 0;
			return namaCocok && (!divisiDipilih || String(item.divisi || '').trim() === divisiDipilih)
			&& siap.rincian.some(function (r) { return (!dari || r.tanggal >= dari) && (!sampai || r.tanggal <= sampai); });
		}).map(function (siap) {
			var salinan = Object.assign({}, siap.item);
			salinan.rincian_harian = siap.rincian.filter(function (r) {
			return (!dari || r.tanggal >= dari) && (!sampai || r.tanggal <= sampai);
			}).map(function (r) { return r.data; });
			return salinan;
		});
		hitung.textContent = 'Menampilkan ' + tersaring.length + ' dari ' + data.length + ' karyawan';
		if (!tersaring.length) {
			hasil.appendChild(el('div', { class: 'info', text: data.length ? 'Tidak ada data lembur yang cocok dengan filter.' : 'Belum ada data lembur.' }));
			return;
		}
		hasil.appendChild(bangunMatriksLembur(tersaring, dari, sampai));
		}
		var filterTimer = null;
		if (cariNama) cariNama.addEventListener('input', function () {
		clearTimeout(filterTimer);
		filterTimer = setTimeout(tampilkanHasil, 120);
		});
		if (pilihDivisi) pilihDivisi.addEventListener('change', tampilkanHasil);
		tanggalDari.addEventListener('change', tampilkanHasil);
		tanggalSampai.addEventListener('change', tampilkanHasil);
		tampilkanHasil();
	}).catch(function (e) {
		if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') {
		kotak.className = 'alert';
		kotak.textContent = pesanError(e);
		}
	});
	}

	function bangunMatriksLembur(data, dari, sampai) {
	if (!Array.isArray(data) || !data.length) return el('div', { class: 'info', text: 'Belum ada data lembur.' });

	var tanggalSet = Object.create(null);
	data.forEach(function (row) {
		(row.rincian_harian || []).forEach(function (r) {
		if (r.tanggal) tanggalSet[r.tanggal] = true;
		});
	});
	var tanggalTersedia = Object.keys(tanggalSet).sort();
	if (!tanggalTersedia.length && !dari && !sampai) return el('div', { class: 'info', text: 'Tidak ada rincian harian pada data ini.' });
	var awal = dari || tanggalTersedia[0] || sampai;
	var akhir = sampai || tanggalTersedia[tanggalTersedia.length - 1] || dari;
	if (awal && akhir && awal > akhir) { var tukar = awal; awal = akhir; akhir = tukar; }
	var tanggalUnik = [];
	if (awal && akhir) {
		var tanggalBerjalan = new Date(awal + 'T00:00:00');
		var tanggalAkhir = new Date(akhir + 'T00:00:00');
		while (!isNaN(tanggalBerjalan) && tanggalBerjalan <= tanggalAkhir) {
		tanggalUnik.push(isoHari(tanggalBerjalan));
		tanggalBerjalan.setDate(tanggalBerjalan.getDate() + 1);
		}
	} else tanggalUnik = tanggalTersedia;
	if (!tanggalUnik.length) return el('div', { class: 'info', text: 'Tidak ada rincian harian pada data ini.' });

	var perKaryawan = Object.create(null);
	data.forEach(function (row) {
		var kunci = String(row.no_absen || row.nama || '').trim().toLowerCase();
		if (!kunci) return;
		if (!perKaryawan[kunci]) {
		perKaryawan[kunci] = { nama: row.nama || '', divisi: row.divisi || '', cells: Object.create(null), total: 0 };
		}
		(row.rincian_harian || []).forEach(function (r) {
		var t = String(r.tanggal || '');
		var j = Number(r.jam) || 0;
		if (!t || j <= 0) return;
		perKaryawan[kunci].cells[t] = (perKaryawan[kunci].cells[t] || 0) + j;
		perKaryawan[kunci].total += j;
		});
	});

	var daftar = Object.keys(perKaryawan).map(function (k) { return perKaryawan[k]; });
	daftar.sort(function (a, b) {
		return String(a.nama).localeCompare(String(b.nama), 'id', { sensitivity: 'base' });
	});

	var headers = ['Nama'].concat(tanggalUnik.map(function (tgl) {
		return dmy(tgl).split('/').slice(0, 2).join('/');
	}), ['Total']);

	var rows = daftar.map(function (k) {
		var nama = el('div', { class: 'lembur-card-person' }, [
		el('strong', { text: k.nama }),
		el('span', { text: k.divisi })
		]);
		var sel = tanggalUnik.map(function (tgl) {
		var jam = k.cells[tgl];
		if (!jam) return '—';
		return el('span', { class: 'lembur-value' }, [
			el('span', { text: String(Number(jam.toFixed(2))) })
		]);
		});
		return [nama].concat(sel, [
		el('strong', { class: 'lembur-total', text: String(Number(k.total.toFixed(2))) })
		]);
	});

	var tbl = tabel(headers, rows);
	tbl.classList.add('lembur-matrix-wrap');
	var table = tbl.querySelector('table');
	if (table) {
		table.classList.add('lembur-matrix');
		var ths = table.querySelectorAll('thead th');
		Array.prototype.forEach.call(ths, function (th, idx) {
		if (idx > 0 && idx <= tanggalUnik.length) {
			var tgl = tanggalUnik[idx - 1];
			var tanggal = new Date(tgl + 'T00:00:00');
			var namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][tanggal.getDay()];
			var hariLibur = tanggal.getDay() === 0 || (typeof LIBUR_NASIONAL !== 'undefined' && !!LIBUR_NASIONAL[tgl])
			|| (typeof CUTI_BERSAMA !== 'undefined' && !!CUTI_BERSAMA[tgl]);
			th.setAttribute('data-tanggal-singkat', tgl.slice(8, 10) + '/' + tgl.slice(5, 7));
			th.setAttribute('data-hari', tgl.slice(8, 10));
			th.setAttribute('title', namaHari + ', ' + dmy(tgl));
			th.textContent = '';
			th.appendChild(el('span', { class: 'lembur-day-name', text: namaHari }));
			th.appendChild(el('span', { class: 'lembur-date-number', text: tgl.slice(8, 10) + '/' + tgl.slice(5, 7) }));
			if (hariLibur) {
			th.classList.add('lembur-libur');
			Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
				var td = tr.children[idx];
				if (!td) return;
				td.classList.add('lembur-libur');
				var nilai = td.querySelector('.lembur-value');
				if (nilai) nilai.classList.add('lembur-libur');
			});
			}
		}
		});
		if (ths.length > 1) {
		function tombolGeser(th, arah, simbol, label, kelas) {
			var tombol = el('button', { type: 'button', class: 'lembur-scroll-control ' + kelas, text: simbol, 'aria-label': label, title: label });
			tombol.addEventListener('click', function () {
			var kolomTanggal = ths[1];
			var langkah = kolomTanggal ? kolomTanggal.getBoundingClientRect().width * 3 : 150;
			tbl.scrollBy({ left: arah * langkah, behavior: 'smooth' });
			});
			th.appendChild(tombol);
		}
		tombolGeser(ths[0], -1, '‹', 'Geser ke tanggal sebelumnya', 'lembur-scroll-left');
		tombolGeser(ths[ths.length - 1], 1, '›', 'Geser ke tanggal berikutnya', 'lembur-scroll-right');
		}
	}
	return tbl;
	}

	/* ===== REKAPAN: rekap kerja (tabel/kartu) + slip gaji (kartu) ===== */
	var REKAP_UANG = /gaji|upah|tunjangan|potongan|bonus|insentif|total|bersih|netto|uang|thr|bpjs|pajak|pph|premi|nominal|rupiah|kasbon|pinjaman|denda|transport|makan/i;
	var REKAP_BUKAN = /hari|jam|jumlah|hadir|alpa|alpha|izin|cuti|sakit|libur|menit|kali|nomor|^no$|no_|tanggal|bulan|tahun|periode/i;
	var REKAP_TOTAL = /total|bersih|netto|diterima|take_?home|gaji_akhir/i;
	function rekapLabel(k) { var t = String(k).replace(/_/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); }
	function rekapAngka(v) {
	if (typeof v === 'number') return isFinite(v) ? v : null;
	var s = String(v == null ? '' : v).trim();
	return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
	}
	function rekapUang(k, v) {
	if (rekapAngka(v) === null) return false;
	if (/lembur/i.test(k) && !/uang|upah|rp|nominal/i.test(k)) return false;
	return REKAP_UANG.test(k) && !REKAP_BUKAN.test(k);
	}
	function rekapNilai(k, v) {
	if (v == null || v === '') return '—';
	if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return dmy(v);
	if (rekapUang(k, v)) { var n = rekapAngka(v); return (n < 0 ? '-' : '') + 'Rp ' + Math.abs(n).toLocaleString('id-ID'); }
	return String(v);
	}
	function rekapKunci(rows, sendiri) {
	var seen = {}, keys = [];
	rows.forEach(function (r) {
		Object.keys(r).forEach(function (k) {
		if (k.charAt(0) === '_' || seen[k] || (sendiri && k === 'no_absen')) return;
		seen[k] = 1; keys.push(k);
		});
	});
	return keys;
	}
	function renderRekapanKaryawan() {
	var isi = halaman('Rekapan & Slip Gaji',
		'Rincian gaji dan lembur per periode yang sudah dihitung HRD.');
	var kotak = el('div', { class: 'info loading', text: 'Memuat data gaji…' });
	isi.appendChild(kotak);

	api('karyawanRekapan').then(function (r) {
		kotak.remove();
		var payslips = (r && r.payslips) || [];
		var cakupan = (r && r.cakupan) || 'sendiri';

		if (!payslips.length) {
		isi.appendChild(el('div', { class: 'info',
			text: 'Belum ada slip gaji yang dipublikasikan. Hubungi HRD bila perlu.' }));
		return;
		}

		// Kumpulkan periode unik (dari|sampai), ambil label + sortKey terbaru per periode
		var periodeMap = {};
		payslips.forEach(function (p) {
		var key = (p.periodeDari || '') + '|' + (p.periodeSampai || '');
		if (!key || key === '|') return;
		var sortKey = (p.periodeSampai || '') + '|' + (p.dihitungPada || '');
		if (!periodeMap[key] || periodeMap[key].sortKey < sortKey) {
			periodeMap[key] = {
			key: key,
			label: dmy(p.periodeDari) + ' – ' + dmy(p.periodeSampai),
			sortKey: sortKey
			};
		}
		});
		var periode = Object.keys(periodeMap).map(function (k) { return periodeMap[k]; })
		.sort(function (a, b) { return b.sortKey.localeCompare(a.sortKey); });

		if (!periode.length) {
		isi.appendChild(el('div', { class: 'info', text: 'Data gaji belum lengkap. Hubungi HRD.' }));
		return;
		}

		var pilihPeriode = el('select', { 'aria-label': 'Pilih periode slip gaji' },
		periode.map(function (o) { return el('option', { value: o.key, text: o.label }); }));

		var cariNama = el('input', { type: 'search', placeholder: 'Cari nama karyawan…', 'aria-label': 'Cari nama karyawan' });
		var wrapCari = fieldEl('Cari nama', cariNama);
		if (cakupan === 'sendiri') wrapCari.classList.add('hidden');

		var kartuBox = el('div');
		isi.appendChild(el('div', {
		class: 'toolbar',
		style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;align-items:end;margin-bottom:14px'
		}, [
		fieldEl('Periode', pilihPeriode),
		wrapCari
		]));
		isi.appendChild(kartuBox);

		function tampilkan() {
		kartuBox.innerHTML = '';
		var key = pilihPeriode.value;
		var q = cariNama.value.trim().toLowerCase();

		// Ambil snapshot terbaru per karyawan untuk periode ini
		var byKaryawan = {};
		payslips.forEach(function (p) {
			var pKey = (p.periodeDari || '') + '|' + (p.periodeSampai || '');
			if (pKey !== key) return;
			var kunciKar = String(p.noAbsen || '').toLowerCase();
			if (!kunciKar) return;
			var sortKey = p.dihitungPada || '';
			if (!byKaryawan[kunciKar] || byKaryawan[kunciKar].sortKey < sortKey) {
			byKaryawan[kunciKar] = { data: p, sortKey: sortKey };
			}
		});

		var list = Object.keys(byKaryawan).map(function (k) { return byKaryawan[k].data; });
		var filtered = list.filter(function (p) {
			return !q || (String(p.nama || '') + ' ' + String(p.noAbsen || '')).toLowerCase().indexOf(q) >= 0;
		});

		if (!filtered.length) {
			kartuBox.appendChild(el('div', { class: 'info', text: list.length
			? 'Tidak ada karyawan yang cocok dengan pencarian.'
			: 'Belum ada slip gaji untuk periode ini.' }));
			return;
		}

		if (filtered.length === 1) {
			kartuBox.appendChild(buatKartuPayslip(filtered[0]));
		} else {
			var info = el('p', { class: 'sub2', text: 'Menampilkan ' + filtered.length + ' dari ' + list.length + ' karyawan.' });
			info.style.marginBottom = '10px';
			kartuBox.appendChild(info);
			var grid = el('div', { class: 'slip-grid' });
			filtered.forEach(function (p) { grid.appendChild(buatKartuPayslip(p)); });
			kartuBox.appendChild(grid);
		}
		}

		pilihPeriode.addEventListener('change', tampilkan);
		cariNama.addEventListener('input', tampilkan);
		tampilkan();
	}).catch(function (e) {
		if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') {
		kotak.className = 'alert';
		kotak.textContent = pesanError(e);
		}
	});
	}

	function buatKartuPayslip(p) {
	function rp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
	var periode = dmy(p.periodeDari) + ' – ' + dmy(p.periodeSampai);
	var tanpaGaji = !!p.tanpaGajiHarian;
	var statusKaryawan = p.status || '';

	var head = el('div', { class: 'slip-head',
		style: 'padding:16px 18px;border-bottom:3px solid var(--ink);background:var(--hd)' }, [
		el('div', { style: 'min-width:0;flex:1' }, [
		el('span', { class: 'slip-eyebrow', text: 'SLIP GAJI' }),
		el('h4', { text: p.nama || 'Karyawan', style: 'margin:2px 0 0;line-height:1.25' }),
		el('span', { class: 'sub2', text: periode, style: 'margin-top:2px' })
		]),
		el('span', { class: 'chip', text: statusKaryawan ? statusKaryawan + ' · ' + (p.divisi || '—') : (p.divisi || '—') })
	]);

	function baris(label, sub, nominal, kuat) {
		return el('div', { class: 'slip-row' + (kuat ? ' total' : '') }, [
		el('dt', null, [el('span', { text: label }), sub ? el('small', { class: 'sub2', text: sub }) : null]),
		el('dd', { text: nominal })
		]);
	}
	var dl = el('dl', { class: 'slip-list' }, [
		tanpaGaji
		? baris('Gaji Pokok', 'Status ' + (statusKaryawan || 'HT/KT') + ' — dibayar di luar sistem ini', rp(0))
		: baris('Gaji Pokok', p.hariDibayar + ' hari × ' + rp(p.upahHarian), rp(p.nominalGaji)),
		baris('Lembur', Number(p.jamLembur).toFixed(2) + ' jam × ' + rp(p.tarifLembur), rp(p.nominalLembur)),
		baris('TOTAL DITERIMA', null, rp(p.totalNominal), true)
	]);
	var footer = el('div', { class: 'aksi', style: 'padding:14px 18px;border-top:2px solid var(--ink)' }, [
		btn('Cetak / PDF', 'primary', function () { cetakPayslipSatu(p); }),
		el('span', { class: 'sub2', style: 'margin-left:auto',
		text: 'Dihitung ' + (p.dihitungPada || '—') })
	]);
	return el('article', { class: 'slip-card' }, [head, dl, footer]);
	}

	function cetakPayslipSatu(p) {
	bukaJendelaCetak(bungkusHtmlCetak(renderPayslipHtml({
		noAbsen: p.noAbsen, nama: p.nama, divisi: p.divisi, jabatan: p.jabatan,
		periodeDari: p.periodeDari, periodeSampai: p.periodeSampai,
		hariDibayar: p.hariDibayar, upahHarian: p.upahHarian, nominalGaji: p.nominalGaji,
		jamLembur: p.jamLembur, tarifLembur: p.tarifLembur, nominalLembur: p.nominalLembur,
		totalNominal: p.totalNominal
	}), 'Slip ' + p.nama));
	}

	/* Print helpers (duplikat, karena file ini terpisah dari admin) */
	function renderPayslipHtml(x) {
	function rp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
	function tgl(v) { return v ? String(v).split('-').reverse().join('/') : '—'; }
	var periode = tgl(x.periodeDari || x.periode_dari) + ' s.d. ' + tgl(x.periodeSampai || x.periode_sampai);
	var tanpaGaji = !!(x.tanpaGajiHarian || x.tanpa_gaji_harian);
	var statusKaryawan = x.status || '';
	
	var gajiRow;
	if (tanpaGaji) {
		gajiRow = '<tr>' +
		'<td>Gaji Pokok</td>' +
		'<td colspan="2"><em style="color:#666">Status ' + (statusKaryawan || 'HT/KT') + ' — dibayar di luar rekapan ini</em></td>' +
		'<td>' + rp(0) + '</td></tr>';
	} else {
		gajiRow = '<tr>' +
		'<td>Gaji Pokok</td>' +
		'<td>' + (x.hariDibayar || x.hari_dibayar || 0) + ' hari</td>' +
		'<td>' + rp(x.upahHarian || x.upah_harian) + '</td>' +
		'<td>' + rp(x.nominalGaji || x.nominal_gaji) + '</td></tr>';
	}
	
	return '' +
		'<div class="payslip">' +
		'<div class="slip-head"><div class="slip-brand">' +
			'<div class="slip-logo">RJP</div>' +
			'<div><strong>PT RAJA PALMA</strong><small>Human Resources</small></div>' +
		'</div><div class="slip-title">SLIP GAJI<br><small>' + periode + '</small></div></div>' +
		'<div class="slip-info">' +
			'<div><label>No. Absen</label><span>' + (x.noAbsen || x.no_absen || '—') + '</span></div>' +
			'<div><label>Nama</label><span>' + (x.nama || '—') + '</span></div>' +
			'<div><label>Divisi</label><span>' + (x.divisi || '—') + '</span></div>' +
			'<div><label>Status</label><span>' + (statusKaryawan || '—') + '</span></div>' +
		'</div>' +
		'<table class="slip-table">' +
			'<thead><tr><th>Komponen</th><th>Jumlah</th><th>Tarif</th><th>Nominal</th></tr></thead>' +
			'<tbody>' +
			gajiRow +
			'<tr><td>Lembur</td><td>' + Number(x.jamLembur || x.jam_lembur || 0).toFixed(2) + ' jam</td>' +
				'<td>' + rp(x.tarifLembur || x.tarif_lembur_per_jam) + '</td>' +
				'<td>' + rp(x.nominalLembur || x.nominal_lembur) + '</td></tr>' +
			'<tr class="total"><td colspan="3">TOTAL DITERIMA</td><td>' +
				rp(x.totalNominal || x.total_nominal) + '</td></tr>' +
			'</tbody>' +
		'</table>' +
		(tanpaGaji ? '<p style="font-size:11px;color:#666;margin-top:-10px;margin-bottom:10px;font-style:italic">Catatan: Gaji pokok karyawan berstatus ' + (statusKaryawan || 'HT/KT') + ' dibayarkan melalui jalur penggajian bulanan. Slip ini hanya mencakup lembur.</p>' : '') +
		'<div class="slip-foot">' +
			'<div class="ttd"><span>Karyawan</span><i></i></div>' +
			'<div class="ttd"><span>HRD / Finance</span><i></i></div>' +
		'</div>' +
		'<p class="slip-note">Dokumen dibuat otomatis oleh sistem. Hubungi HRD bila ada pertanyaan.</p>' +
		'</div>';
	}

	function bungkusHtmlCetak(body, judul) {
	return '<!doctype html><html><head><meta charset="utf-8"><title>' + (judul || 'Slip Gaji') + '</title><style>' +
		'@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;color:#000;margin:0}' +
		'.page-break{page-break-after:always;height:0}' +
		'.payslip{padding:0;margin:0 0 10px}' +
		'.slip-head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #000;padding-bottom:12px;margin-bottom:16px}' +
		'.slip-brand{display:flex;align-items:center;gap:10px}' +
		'.slip-logo{width:56px;height:56px;border:2px solid #000;border-radius:8px;display:grid;place-items:center;font-size:18px;font-weight:800}' +
		'.slip-brand strong{font-size:18px;display:block}.slip-brand small{font-size:10px;letter-spacing:2px;display:block;margin-top:2px}' +
		'.slip-title{text-align:right;font-size:16px;font-weight:800;line-height:1.3}.slip-title small{font-size:11px;font-weight:600}' +
		'.slip-info{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;padding:14px;background:#f4f4f4;border-radius:6px;margin-bottom:16px}' +
		'.slip-info div{display:flex;gap:8px;font-size:12px}.slip-info label{min-width:80px;font-weight:700}' +
		'.slip-table{width:100%;border-collapse:collapse;margin-bottom:20px}' +
		'.slip-table th,.slip-table td{padding:9px 12px;border:1px solid #999;text-align:left;font-size:12px}' +
		'.slip-table th{background:#e8e8e8;font-size:10px;text-transform:uppercase;letter-spacing:1px}' +
		'.slip-table td:nth-child(2),.slip-table td:nth-child(3),.slip-table td:nth-child(4){text-align:right;font-variant-numeric:tabular-nums}' +
		'.slip-table .total{background:#f0f0f0;font-weight:800;font-size:13px}' +
		'.slip-foot{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px}' +
		'.ttd{text-align:center;font-size:12px}.ttd i{display:block;border-top:1px solid #000;margin-top:55px}' +
		'.slip-note{text-align:center;font-size:10px;color:#666;margin-top:20px}' +
		'</style></head><body>' + body + '</body></html>';
	}

	function bukaJendelaCetak(html) {
	var w = window.open('', '_blank', 'width=800,height=900');
	if (!w) { toast('Izinkan pop-up untuk mencetak / simpan PDF.'); return; }
	w.document.open(); w.document.write(html); w.document.close();
	setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 400);
	}

	function tampilJam() {
	try {
		$('jam').textContent = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
		hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
	} catch (e) {}
	}
	function toggleLihat(idInput, idTombol) {
	$(idTombol).addEventListener('click', function () {
		var x = $(idInput), tampil = x.type === 'password';
		x.type = tampil ? 'text' : 'password';
		this.textContent = tampil ? 'Sembunyikan' : 'Lihat';
		this.setAttribute('aria-pressed', String(tampil));
	});
	}
	function pulihkanSesi() {
	S.token = bacaToken();
	if (!S.token) { if (typeof fokusAwal === 'function') fokusAwal(); return; }
	api('sesiInfo').then(function (r) {
		if (!peranCocok(r.peran)) { var t = S.token; resetSesi(); cabutToken(t); tampilPesan('Sesi tidak sesuai dengan portal ini. Silakan login lagi.'); return; }
		S.peran = r.peran; S.karyawan = r.karyawan || null; S.hak = r.hakAkses || [];
		bukaAplikasi();
		mulaiHeartbeatPortal();
	}).catch(function (e) {
		if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') { resetSesi(); tampilPesan('Tidak dapat memeriksa sesi: ' + pesanError(e)); }
	});
	}
	// UBAH NOMOR INI SENDIRI: format internasional tanpa tanda +, spasi, atau strip.
	var NOMOR_WA_BANTUAN_PASSWORD = '6285268499210';

	function initBersama() {
	pasangPerlindunganInteraksi();
	tampilJam(); setInterval(tampilJam, 1000);
	var temaAwal = 'light';
	try { temaAwal = localStorage.getItem('hrd_tema') || 'light'; } catch (e) {}
	aturTema(temaAwal === 'dark');
	function toggleTema() {
		aturTema(document.documentElement.getAttribute('data-theme') !== 'dark');
	}
	$('themeToggle').addEventListener('click', toggleTema);
	$('loginThemeToggle').addEventListener('click', toggleTema);

	var lupaModal = $('lupaPasswordModal');
	$('bukaLupaPassword').addEventListener('click', function () {
		lupaModal.classList.remove('hidden');
		$('tutupLupaPassword').focus();
	});
	function tutupLupaModal() {
		lupaModal.classList.add('hidden');
		$('bukaLupaPassword').focus();
	}
	$('tutupLupaPassword').addEventListener('click', tutupLupaModal);
	lupaModal.addEventListener('click', function (e) {
		if (e.target === lupaModal) tutupLupaModal();
	});
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && !lupaModal.classList.contains('hidden')) tutupLupaModal();
	});
	$('hubungiWhatsApp').addEventListener('click', function () {
		var nomor = String(NOMOR_WA_BANTUAN_PASSWORD || '').replace(/\\D/g, '');
		if (!nomor || /x/i.test(NOMOR_WA_BANTUAN_PASSWORD)) {
		alert('Nomor WhatsApp belum diatur. Ubah NOMOR_WA_BANTUAN_PASSWORD di script terlebih dahulu.');
		return;
		}
		var pesanWA = 'Halo Admin, saya karyawan PT Raja Palma. Saya lupa password Portal Karyawan dan perlu bantuan pemulihan akun.';
		var urlWA = 'https://wa.me/' + nomor + '?text=' + encodeURIComponent(pesanWA);
		window.open(urlWA, '_blank', 'noopener,noreferrer');
	});

	$('menuToggle').addEventListener('click', function () {
		aturMenu(!$('app').classList.contains('nav-open'));
	});

	// Geser kiri/kanan pada konten untuk berpindah ke modul berikut/sebelumnya.
	var titikAwalGestur = null;
	$('isi').addEventListener('touchstart', function (e) {
		if (!window.matchMedia('(max-width: 800px)').matches || e.touches.length !== 1) {
		titikAwalGestur = null;
		return;
		}
		if (document.querySelector('.overlay:not(.hidden), #lupaPasswordModal:not(.hidden)')) {
		titikAwalGestur = null;
		return;
		}
		var target = e.target;
		if (target.closest('input, textarea, select, button, a, [contenteditable="true"], .tabelbungkus, [role="dialog"]')) {
		titikAwalGestur = null;
		return;
		}
		var sentuhan = e.touches[0];
		// Sisakan tepi layar untuk gestur kembali milik browser/OS.
		if (sentuhan.clientX < 28 || sentuhan.clientX > window.innerWidth - 28) {
		titikAwalGestur = null;
		return;
		}
		titikAwalGestur = { x: sentuhan.clientX, y: sentuhan.clientY };
	}, { passive: true });
	document.addEventListener('touchend', function (e) {
		if (!titikAwalGestur || !e.changedTouches.length) return;
		var awal = titikAwalGestur;
		titikAwalGestur = null;
		if (!window.matchMedia('(max-width: 800px)').matches) return;
		var akhir = e.changedTouches[0];
		var dx = akhir.clientX - awal.x, dy = akhir.clientY - awal.y;
		var ambang = Math.max(70, Math.min(110, window.innerWidth * 0.18));
		if (Math.abs(dx) < ambang || Math.abs(dx) < Math.abs(dy) * 1.3) return;
		var nav = $('menu');
		var tombolModul = Array.prototype.slice.call(nav.querySelectorAll('.nav[data-id]'));
		var aktif = tombolModul.findIndex(function (b) { return b.getAttribute('aria-current') === 'page'; });
		if (aktif < 0) return;
		var tujuan = aktif + (dx < 0 ? 1 : -1);
		// Jangan menutup portal atau berpindah keluar halaman saat sudah di ujung daftar.
		if (tujuan >= 0 && tujuan < tombolModul.length) pilih(tombolModul[tujuan].dataset.id);
	}, { passive: true });
	document.addEventListener('touchcancel', function () { titikAwalGestur = null; }, { passive: true });

	// Gestur dari tepi mengikuti entri menu yang sama dengan tombol Back/Forward browser.
	var gesturTepiAwal = null;
	document.addEventListener('touchstart', function (e) {
		if ($('app').classList.contains('hidden') || e.touches.length !== 1
		|| document.querySelector('.overlay:not(.hidden), #lupaPasswordModal:not(.hidden)')) {
		gesturTepiAwal = null;
		return;
		}
		var sentuhan = e.touches[0], lebar = window.innerWidth;
		if (sentuhan.clientX <= 24 && indeksRiwayatMenu > 0) gesturTepiAwal = { x: sentuhan.clientX, y: sentuhan.clientY, tepi: 'kiri' };
		else if (sentuhan.clientX >= lebar - 24 && indeksRiwayatMenu < riwayatMenu.length - 1) gesturTepiAwal = { x: sentuhan.clientX, y: sentuhan.clientY, tepi: 'kanan' };
		else gesturTepiAwal = null;
	}, { passive: true });
	document.addEventListener('touchend', function (e) {
		if (!gesturTepiAwal || !e.changedTouches.length) return;
		var awal = gesturTepiAwal;
		gesturTepiAwal = null;
		var akhir = e.changedTouches[0], dx = akhir.clientX - awal.x, dy = akhir.clientY - awal.y;
		if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
		if (awal.tepi === 'kiri' && dx > 0) history.back();
		else if (awal.tepi === 'kanan' && dx < 0) history.forward();
	}, { passive: true });
	document.addEventListener('touchcancel', function () { gesturTepiAwal = null; }, { passive: true });
	window.addEventListener('popstate', function (e) {
		if ($('app').classList.contains('hidden') || !e.state || e.state.__rpPortalMenu !== true) return;
		var id = e.state.menuId;
		if (typeof id !== 'string') return;
		indeksRiwayatMenu = Number(e.state.menuIndex);
		pilih(id, true);
	});

	$('menu').addEventListener('pointerenter', function () {
		clearTimeout(menuCloseTimer);
	});
	$('menu').addEventListener('pointerleave', jadwalkanTutupMenu);
	$('masuk').addEventListener('click', masuk);
	function tutupPilihanAkun() {
		$('profilToggle').setAttribute('aria-expanded', 'false');
		$('profilMenu').classList.add('hidden');
	}
	$('bukaProfil').addEventListener('click', function () {
		tutupPilihanAkun(); pilih('profil');
	});
	$('gantiPasswordMenu').addEventListener('click', function () {
		tutupPilihanAkun(); pilih('password');
	});
	$('keluar').addEventListener('click', function () {
		tutupPilihanAkun(); keluar();
	});
	$('profilToggle').addEventListener('click', function () {
		var buka = this.getAttribute('aria-expanded') !== 'true';
		this.setAttribute('aria-expanded', String(buka)); $('profilMenu').classList.toggle('hidden', !buka);
		if (buka) requestAnimationFrame(posisikanMenuProfil);
	});
	window.addEventListener('resize', posisikanMenuProfil);
	window.addEventListener('scroll', posisikanMenuProfil, true);
	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', posisikanMenuProfil);
		window.visualViewport.addEventListener('scroll', posisikanMenuProfil);
	}
	document.addEventListener('click', function (e) {
		tutupMenu();
		var app = $('app'), nav = $('menu'), tombolNav = $('menuToggle');
		if (app.classList.contains('nav-open') && !nav.contains(e.target) && !tombolNav.contains(e.target)) aturMenu(false);
		if (!$('profilToggle').contains(e.target) && !$('profilMenu').contains(e.target)) {
		$('profilToggle').setAttribute('aria-expanded', 'false'); $('profilMenu').classList.add('hidden');
		}
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { tutupMenu(); $('profilToggle').setAttribute('aria-expanded', 'false'); $('profilMenu').classList.add('hidden'); }
	});
	window.addEventListener('scroll', tutupMenu, true);
	}

	var MENU_KARYAWAN = [
	{ id: 'beranda', n: 'Beranda', k: 'Menu utama' },
	{ id: 'absensi', n: 'Absensi', k: 'Riwayat & dinas luar' },
	{ id: 'lembur', n: 'Lembur', k: 'Riwayat lembur' },
	{ id: 'rekapan', n: 'Rekapan', k: 'Ringkasan kerja dan slip' },
	{ id: 'disiplin', n: 'Disiplin', k: 'Catatan disiplin' },
	{ id: 'sop', n: 'SOP', k: 'Prosedur kerja' },
	{ id: 'karyawan', n: 'Data Karyawan', k: 'Direktori terbatas' },
	{ id: 'profil', n: 'Data Pribadi', k: 'Profil karyawan' },
	{ id: 'password', n: 'Ganti Password', k: 'Keamanan akun' }
	];
	var HAL = {
	beranda: renderBeranda, profil: renderProfilSendiri, karyawan: renderDirektori, absensi: renderAbsensiKaryawan,
	disiplin: renderModulData, sop: renderModulData, lembur: renderLemburKaryawan, rekapan: renderRekapanKaryawan, password: renderGantiPassword
	};
	function hakDari(id) {
	return S.hak.filter(function (h) { return h.menuId === id; })[0]
		|| { lihat: false, cakupan: 'sendiri', tambah: false, edit: false, hapus: false };
	}
	function boleh(id, aksi) {
	var h = hakDari(id);
	if (!h || !h.lihat) return false;
	if (!aksi || aksi === 'lihat') return true;
	return h[aksi] === true;
	}
	function bolehEdit(id) { return boleh(id, 'edit'); }
	function bolehHapus(id) { return boleh(id, 'hapus'); }
	function bolehTambah(id) { return boleh(id, 'tambah'); }
	function labelPeran() { return 'Karyawan · ' + ((S.karyawan && S.karyawan.nama) || ''); }
	function daftarMenu() { return MENU_KARYAWAN.filter(function (m) { if (m.id === 'beranda') return true; var hak = hakDari(m.id); return m.id !== 'profil' && m.id !== 'password' && hak.lihat; }); }
	function halamanAwal(daftar) {
	if (S.karyawan && S.karyawan.wajibGantiPassword) return 'password';
	return 'beranda';
	}
	function stateRiwayatMenu(id, indeks) {
	var state = history.state && typeof history.state === 'object' ? Object.assign({}, history.state) : {};
	state.__rpPortalMenu = true;
	state.menuId = id;
	state.menuIndex = indeks;
	return state;
	}
	function siapkanRiwayatMenu(id) {
	riwayatMenu = [id];
	indeksRiwayatMenu = 0;
	riwayatMenuSiap = true;
	try { history.replaceState(stateRiwayatMenu(id, 0), '', location.href); } catch (e) {}
	}
	function simpanNavigasiMenu(id) {
	if (!riwayatMenuSiap) { siapkanRiwayatMenu(id); return; }
	if (riwayatMenu[indeksRiwayatMenu] === id) return;
	var berikutnya = riwayatMenu.slice(0, indeksRiwayatMenu + 1);
	berikutnya.push(id);
	var indeksBaru = berikutnya.length - 1;
	try { history.pushState(stateRiwayatMenu(id, indeksBaru), '', location.href); }
	catch (e) { return; }
	riwayatMenu = berikutnya;
	indeksRiwayatMenu = indeksBaru;
	}
	function pilih(id, dariRiwayat) {
	if (S.karyawan && S.karyawan.wajibGantiPassword && id !== 'password') { toast('Ganti password terlebih dahulu.'); return; }
	if (id !== 'beranda' && id !== 'password' && id !== 'profil' && !hakDari(id).lihat) { toast('Menu ini tidak diizinkan untuk akun Anda.'); return; }
	if (!dariRiwayat) simpanNavigasiMenu(id);
	if (pengendaliHalaman) pengendaliHalaman.abort();
	pengendaliHalaman = typeof AbortController !== 'undefined' ? new AbortController() : null;
	batalkanTekanLamaAktif();
	$('app').classList.toggle('home-active', id === 'beranda');
	// Beranda wajib selalu tanpa navbar; reset juga status dan aria tombol menu.
	if (id === 'beranda') aturMenu(false);
	document.querySelectorAll('.nav').forEach(function (n) {
		if (n.dataset.id === id) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
	});
	var navAktif = document.querySelector('.nav[aria-current="page"]');
	if (navAktif && $('app').classList.contains('nav-open') && window.matchMedia('(max-width: 800px)').matches) {
		navAktif.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
	}
	tutupMenu();
	if (id === 'absensi') absHomeK = true;
	var fn = HAL[id];
	if (fn) fn(id);
	window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
	}
	function ambilLogin() {
	var u = $('employeeUsername').value.trim(), pw = $('employeePassword').value;
	if (!u || !pw) { tampilPesan('Isi nomor absen dan password.'); return null; }
	return { aksi: 'karyawanLogin', param: { username: u, password: pw } };
	}
	function bersihLogin() { $('employeePassword').value = ''; }
	function fokusAwal() { $('employeeUsername').focus(); }

	function esc(v) {
	return String(v == null || v === '' ? '—' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	var FOTO_PROFIL_SERVER = '';
	var FOTO_PROFIL_ASLI = '';
	var FOTO_DIREKTORI_SERVER = Object.create(null);
	function fotoProfilTersimpan() { return FOTO_PROFIL_SERVER || ''; }
	function kunciCropFotoProfil() {
		var karyawan = S.karyawan || {};
		var identitas = karyawan.noAbsen || karyawan.no_absen || karyawan.id || 'akun';
		return 'hrd_avatar_crop_' + String(identitas).replace(/[^a-zA-Z0-9_-]/g, '_');
	}
	function bacaCropFotoProfil() {
		try {
			var crop = JSON.parse(localStorage.getItem(kunciCropFotoProfil()) || 'null');
			if (crop) return { zoom: Math.max(1, Math.min(3, Number(crop.zoom) || 1)), x: Math.max(0, Math.min(100, Number(crop.x) || 0)), y: Math.max(0, Math.min(100, Number(crop.y) || 0)) };
		} catch (e) {}
		return { zoom: 1, x: 50, y: 50 };
	}
	function simpanCropFotoProfil(crop) {
		try { localStorage.setItem(kunciCropFotoProfil(), JSON.stringify(crop)); } catch (e) {}
	}
	function terapkanCropFotoProfil(img) {
		var crop = bacaCropFotoProfil();
		img.style.objectFit = 'cover';
		img.style.objectPosition = crop.x + '% ' + crop.y + '%';
		img.style.transform = 'scale(' + crop.zoom + ')';
		img.style.transformOrigin = crop.x + '% ' + crop.y + '%';
	}
	function idFotoKaryawan(r) {
	r = r || {};
	return String(r.id || r.idKaryawan || r.userId || r.user_id || r.noAbsen || r.no_absen || r.nip || '').trim();
	}
	function kunciIdFotoKaryawan(id) { return String(id == null ? '' : id).trim().toLowerCase(); }
	function daftarIdFotoKaryawan(r) {
	r = r || {};
	return [r.id, r.idKaryawan, r.userId, r.user_id, r.noAbsen, r.no_absen, r.nip]
		.filter(function (id) { return id != null && String(id).trim() !== ''; })
		.map(function (id) { return String(id).trim(); });
	}
	function nilaiFotoKaryawan(v) {
	if (typeof v === 'string') return v;
	if (!v || typeof v !== 'object') return '';
	return v.fotoProfilData || v.fotoProfil || v.foto || v.avatar || v.url || v.data || '';
	}
	function fotoServerKaryawan(r) {
	r = r || {};
	var ids = daftarIdFotoKaryawan(r);
	for (var i = 0; i < ids.length; i++) {
		var foto = FOTO_DIREKTORI_SERVER[kunciIdFotoKaryawan(ids[i])];
		if (foto) return foto;
	}
	return nilaiFotoKaryawan(r.fotoProfilData || r.fotoProfil || r.foto || r.avatar);
	}

	// Satu permintaan profil dipakai bersama oleh avatar header dan halaman Profil.
	function ambilProfil() {
	if (!S.profilPromise) {
		var pr = api('karyawanProfil');
		S.profilPromise = pr;
		pr.catch(function () { if (S.profilPromise === pr) S.profilPromise = null; });
	}
	return S.profilPromise;
	}
	function tampilkanFotoProfil(src) {
	var avatar = document.querySelector('.profile-avatar');
	if (!avatar) return;
	avatar.innerHTML = '';
			if (src) {
			var img = el('img', { src: src, alt: 'Foto profil karyawan' });
			terapkanCropFotoProfil(img);
			avatar.appendChild(img);
		} else avatar.appendChild(ikon(IKON.profil));
	}
	// Muat foto dari backend setiap kali sesi Portal Karyawan dibuka,
	// agar avatar header langsung memakai foto terbaru yang tersimpan di Drive.
	function muatFotoProfilHeader() {
	if (PORTAL === 'admin' || !S.token) return;
	FOTO_PROFIL_SERVER = '';
	tampilkanFotoProfil('');
	ambilProfil().then(function (r) {
		if (!r || !r.ok) return;
		FOTO_PROFIL_SERVER = r.fotoProfilData || '';
		FOTO_PROFIL_ASLI = FOTO_PROFIL_SERVER;
		tampilkanFotoProfil(FOTO_PROFIL_SERVER);
	}).catch(function () {
		// Jangan mengganggu proses login/menu jika foto gagal dimuat.
		tampilkanFotoProfil(FOTO_PROFIL_SERVER);
	});
	}
	function namaFileFotoProfil(file) {
		var karyawan = S.karyawan || {};
		function aman(teks, fallback) {
			return String(teks || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || fallback;
		}
		var ekstensi = String(file.name || '').match(/\.([^.]+)$/);
		ekstensi = ekstensi ? ekstensi[1].toLowerCase() : ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[file.type] || 'jpg');
		return aman(karyawan.noAbsen || karyawan.no_absen || karyawan.nip, 'noabsen') + '-' + aman(karyawan.nama, 'karyawan') + '.' + ekstensi;
	}
	function editorPangkasFoto(file) {
	return new Promise(function (selesai, gagal) {
		var url = URL.createObjectURL(file), gambarAsli = new Image(), sudahSelesai = false;
		function akhir(nilai) {
			if (sudahSelesai) return;
			sudahSelesai = true;
			URL.revokeObjectURL(url);
			selesai(nilai);
		}
		gambarAsli.onerror = function () { URL.revokeObjectURL(url); gagal(new Error('File tidak dapat dibaca sebagai gambar.')); };
		gambarAsli.onload = function () {
			var zoom = el('input', { type: 'range', min: '1', max: '3', step: '0.01', value: '1', 'aria-label': 'Perbesar foto' });
			var geserX = el('input', { type: 'range', min: '0', max: '100', value: '50', 'aria-label': 'Atur posisi horizontal foto' });
			var geserY = el('input', { type: 'range', min: '0', max: '100', value: '50', 'aria-label': 'Atur posisi vertikal foto' });
			var bingkai = el('div', { style: 'position:relative;width:min(280px, calc(100vw - 100px));aspect-ratio:1/1;margin:0 auto;overflow:hidden;border:3px solid #fff;border-radius:50%;background:#222;box-shadow:0 0 0 3px #111,0 8px 24px rgba(0,0,0,.45);touch-action:none' });
			var pratinjau = el('img', { src: url, alt: 'Atur potongan foto profil', draggable: 'false', style: 'position:absolute;max-width:none;user-select:none;pointer-events:none' });
			bingkai.appendChild(pratinjau);
			bingkai.appendChild(el('div', { class: 'foto-crop-guide', 'aria-hidden': 'true' }));
			function perbaruiPratinjau() {
				var sisi = bingkai.clientWidth || 280;
				var skala = Math.max(sisi / gambarAsli.naturalWidth, sisi / gambarAsli.naturalHeight) * Number(zoom.value);
				var lebar = gambarAsli.naturalWidth * skala, tinggi = gambarAsli.naturalHeight * skala;
				pratinjau.style.width = lebar + 'px'; pratinjau.style.height = tinggi + 'px';
				pratinjau.style.left = ((sisi - lebar) * Number(geserX.value) / 100) + 'px';
				pratinjau.style.top = ((sisi - tinggi) * Number(geserY.value) / 100) + 'px';
			}
			[zoom, geserX, geserY].forEach(function (input) { input.addEventListener('input', perbaruiPratinjau); });
			var keterangan = el('p', { class: 'sub2', text: 'Geser zoom dan posisi hingga foto pas di dalam bingkai.' });
			var kontrol = el('div', { style: 'display:grid;gap:8px;margin-top:12px' }, [
				fieldEl('Zoom', zoom), fieldEl('Posisi horizontal', geserX), fieldEl('Posisi vertikal', geserY)
			]);
			var hasil = null;
			var modal = bukaModal('Sesuaikan Foto Profil', [bingkai, keterangan, kontrol], [
				{ teks: 'Batal', klik: function (t) { t(); } },
				{ teks: 'Gunakan Foto', kelas: 'primary', klik: function (t, tombol) {
					tombol.disabled = true;
					try {
						var crop = { zoom: Number(zoom.value), x: Number(geserX.value), y: Number(geserY.value) };
						var pembaca = new FileReader();
						pembaca.onerror = function () { tombol.disabled = false; toast('Foto tidak dapat dibaca.', 'error'); };
						pembaca.onload = function () {
							hasil = { nama: namaFileFotoProfil(file), mimeType: file.type || 'image/jpeg', data: pembaca.result, crop: crop };
							t();
						};
						pembaca.readAsDataURL(file);
					} catch (e) { tombol.disabled = false; toast('Foto tidak dapat diproses.', 'error'); }
				} }
			], function () { akhir(hasil); });
			modal.box.classList.add('lebar');
			perbaruiPratinjau();
		};
		gambarAsli.src = url;
	});
	}
	function kontrolFotoProfil(inisial) {
	var kontrol = el('div', { class: 'profile-photo-control' });
	var tombol = el('button', { type: 'button', class: 'avatar profile-photo-button', 'aria-label': 'Pilih foto profil', title: 'Pilih foto profil' });
	var input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif', class: 'hidden', 'aria-label': 'Pilih foto profil' });
	function gambar(src) {
		tombol.innerHTML = '';
		tombol.classList.toggle('has-photo', !!src);
		tombol.setAttribute('aria-label', src ? 'Lihat dan kelola foto profil' : 'Pilih foto profil');
		tombol.title = src ? 'Lihat dan kelola foto profil' : 'Pilih foto profil';
		if (src) { var im = el('img', { src: src, alt: '', decoding: 'async' }); terapkanCropFotoProfil(im); im.addEventListener('error', function () { tombol.textContent = inisial || 'K'; tombol.classList.remove('has-photo'); }); tombol.appendChild(im); }
		else tombol.textContent = inisial || 'K';
	}
	gambar(fotoProfilTersimpan());
	tombol.addEventListener('click', function () {
		var src = fotoProfilTersimpan();
		if (!src) { input.click(); return; }
		var sumberAsli = FOTO_PROFIL_ASLI || src;
		var pratinjau = el('img', { src: sumberAsli, alt: 'Foto profil asli yang diunggah', style: 'display:block;width:min(100%,420px);max-height:65vh;object-fit:contain;margin:0 auto;border-radius:12px' });
		bukaModal('Foto Profil', [pratinjau], [
		{ teks: 'Ubah Foto', kelas: 'primary', klik: function (t) { t(); input.click(); } },
		{ teks: 'Hapus Foto', kelas: 'bahaya', klik: async function (t) {
			t();
			var setuju = await konfirmasi('Hapus foto profil?', 'Foto profil akan dihapus.', 'Hapus', true);
			if (!setuju) return;
			try {
			var hasilHapus = await api('karyawanFotoProfilHapus');
			S.profilPromise = null; FOTO_PROFIL_SERVER = ''; FOTO_PROFIL_ASLI = ''; tampilkanFotoProfil('');
			toast(hasilHapus.pesan || 'Foto profil dihapus.');
			renderProfilSendiri();
			} catch (e) { toast(pesanError(e)); }
		} },
		{ teks: 'Tutup', klik: function (t) { t(); } }
		]);
	});
	input.addEventListener('change', async function () {
		var file = input.files && input.files[0];
		if (!file) return;
		if (!fileGambarValid(file)) { toast('Pilih foto JPG, PNG, WEBP, atau GIF.'); input.value = ''; return; }
		try {
		tombol.disabled = true;
						var hasil = await editorPangkasFoto(file);
				if (!hasil) return;
				toast('Menyimpan foto profil…', 'info');
				var tersimpan = await api('karyawanFotoProfilSimpan', { foto: { nama: hasil.nama, mimeType: hasil.mimeType, data: hasil.data } });
				simpanCropFotoProfil(hasil.crop);
				FOTO_PROFIL_SERVER = tersimpan.fotoProfilData || hasil.data;
				FOTO_PROFIL_ASLI = hasil.data;
				S.profilPromise = null;
		gambar(FOTO_PROFIL_SERVER);
		tampilkanFotoProfil(FOTO_PROFIL_SERVER);
		toast('Foto profil berhasil diterapkan.');
		} catch (e) {
		toast(pesanError(e) || 'Foto profil gagal disimpan.', 'error');
		} finally {
		tombol.disabled = false;
		input.value = '';
		}
	});
	kontrol.appendChild(tombol);
	kontrol.appendChild(input);
	return kontrol;
	}
	function renderBeranda() {
	var isi = $('isi');
	isi.innerHTML = '';
	var namaAwal = String((S.karyawan && S.karyawan.nama) || 'Karyawan').trim();
	var inisialAwal = namaAwal.split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0); }).join('').toUpperCase() || 'K';
	var waktu = new Date();
	var hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
	var bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
	var tanggal = hari[waktu.getDay()] + ', ' + waktu.getDate() + ' ' + bulan[waktu.getMonth()] + ' ' + waktu.getFullYear();
	var kartuProfil = el('button', { type: 'button', class: 'beranda-profile', 'aria-label': 'Buka Profil Karyawan' });
	var foto = el('span', { class: 'beranda-profile-photo', id: 'berandaFoto' });
	function pasangFoto(src, inisial) {
		foto.innerHTML = '';
		if (src) {
		var img = el('img', { src: src, alt: 'Foto profil ' + (namaAwal || 'karyawan'), decoding: 'async' });
		terapkanCropFotoProfil(img);
		img.addEventListener('error', function () { foto.textContent = inisial || inisialAwal; });
		foto.appendChild(img);
		} else foto.textContent = inisial || inisialAwal;
	}
	pasangFoto(fotoProfilTersimpan(), inisialAwal);
	kartuProfil.appendChild(foto);
	kartuProfil.appendChild(el('span', { class: 'beranda-profile-meta' }, [
		el('strong', { id: 'berandaNama', text: namaAwal }),
		el('span', { id: 'berandaProfilSub', text: 'Lihat profil dan data pribadi  ↗' })
	]));
	kartuProfil.addEventListener('click', function () { pilih('profil'); });
	var welcome = el('section', { class: 'beranda-welcome' }, [
		el('div', null, [el('h2', { text: 'Halo, ' + namaAwal + ' 👋' }),
		el('p', { text: 'Selamat datang kembali di portal karyawan.' }),
		el('p', { style: 'margin-top:8px;font-size:12px;font-weight:800', text: tanggal })]),
		kartuProfil
	]);
	isi.appendChild(welcome);
	isi.appendChild(el('div', { class: 'beranda-section-title' }, [el('h3', { text: 'Menu Utama' }), el('p', { text: 'Pilih menu untuk melanjutkan' })]));
	var grid = el('div', { class: 'beranda-menu-grid' });
	var itemBeranda = [
		{id:'absensi',n:'Absensi',k:'Riwayat kehadiran dan dinas luar',c:'#D9EBDD'},
		{id:'lembur',n:'Lembur',k:'Data dan riwayat lembur',c:'#F5EDC7'},
		{id:'rekapan',n:'Rekapan',k:'Ringkasan kerja dan slip',c:'#D8ECE8'},
		{id:'disiplin',n:'Disiplin',k:'Catatan dan riwayat disiplin',c:'#F5E4D5'},
		{id:'sop',n:'SOP',k:'Prosedur dan panduan kerja',c:'#E8E0F5'},
		{id:'karyawan',n:'Data Karyawan',k:'Lihat direktori karyawan',c:'#D8E7F3'}
	];
	itemBeranda.forEach(function (m) {
		var h = hakDari(m.id);
		if (!h || !h.lihat) return;
		var tombol = el('button', { type: 'button', class: 'beranda-menu-card', 'data-menu-id': m.id, style: '--menu-accent:' + m.c });
		tombol.appendChild(el('span', { class: 'beranda-menu-icon' }, [ikon(IKON[m.id] || IKON.profil)]));
		tombol.appendChild(el('span', { class: 'beranda-menu-copy' }, [el('strong', { text: m.n }), el('span', { text: m.k })]));
		tombol.appendChild(el('span', { class: 'beranda-menu-arrow', 'aria-hidden': 'true', text: '↗' }));
		tombol.addEventListener('click', function () { pilih(m.id); });
		grid.appendChild(tombol);
	});
	isi.appendChild(grid);
	// Profil dari backend menjadi sumber nama dan foto, sama dengan halaman Data Pribadi.
	ambilProfil().then(function (r) {
		if (!r || !r.ok) return;
		var p = r.profil || {};
		var nama = String(p.nama || namaAwal).trim();
		var inisial = nama.split(/\s+/).filter(Boolean).slice(0,2).map(function(x){return x.charAt(0);}).join('').toUpperCase() || 'K';
		if ($('berandaNama')) $('berandaNama').textContent = nama;
		var judul = isi.querySelector('.beranda-welcome h2');
		if (judul) judul.textContent = 'Halo, ' + nama + ' 👋';
		if ($('berandaProfilSub')) $('berandaProfilSub').textContent = (p.divisi || 'Karyawan') + ' · Lihat profil ↗';
		if (r.fotoProfilData) {
		FOTO_PROFIL_SERVER = r.fotoProfilData;
		FOTO_PROFIL_ASLI = r.fotoProfilData;
		}
		pasangFoto(FOTO_PROFIL_SERVER, inisial);
	}).catch(function () {});
	}

	function renderProfilSendiri() {
	var isi = halaman('Profil Karyawan');
	var keteranganProfil = el('p', { class: 'sub profile-footnote', text: 'Informasi profil dan data pribadi Anda. Perubahan data dilakukan oleh HRD.' });
	var kotak = el('div', { class: 'info loading', text: 'Memuat data pribadi' });
	isi.appendChild(kotak);
	ambilProfil().then(function (r) {
		var p = r.profil || {};
		FOTO_PROFIL_SERVER = r.fotoProfilData || '';
		FOTO_PROFIL_ASLI = FOTO_PROFIL_SERVER;
		tampilkanFotoProfil(FOTO_PROFIL_SERVER);
		kotak.remove();
		var inisial = String(p.nama || 'K').split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0); }).join('').toUpperCase();
		var fotoKontrol = kontrolFotoProfil(inisial);
		var namaProfil = el('div', { class: 'pf-identity-name' }, [
		el('h4', { text: p.nama || 'Nama belum tersedia' }),
		el('span', { class: 'chip', text: p.divisi || 'Tanpa divisi' }), ' ',
		el('span', { class: 'chip', text: p.jabatan || 'Jabatan belum diisi' }),
		p.kategori ? el('span', { class: 'chip', text: 'Tenaga penugasan · ' + p.kategori }) : null
		]);
		var top = el('div', { class: 'pf-top', style: 'margin-bottom:16px' }, [fotoKontrol, namaProfil]);
		function bagian(judul, fields, pakaiTop) {
		var dl = el('dl', { class: 'pf' });
		fields.forEach(function (f) { dl.appendChild(el('div', f[2] ? { class: 'lebar' } : null, [el('dt', { text: f[0] }), el('dd', { text: f[1] === 0 ? '0' : String(f[1] || '—') })])); });
		isi.appendChild(panelEl(judul, pakaiTop ? el('span', { class: 'status ok', text: p.status || '?' }) : null, [el('div', { class: 'pad' }, [pakaiTop ? top : null, dl])]));
		}
		bagian('Data Karyawan', (p.kategori ? [['Nomor absen', p.noAbsen], ['Kategori penugasan', p.kategori], ['Status kerja', p.status], ['Divisi / lokasi', p.divisi], ['Jabatan', p.jabatan], ['Skema HK', p.kategori === 'Rental' ? (p.skemaHK === 'DIBAYAR' ? 'Dibayar sesuai kehadiran' : 'Tidak dibayar') : 'Mengikuti aturan upah kategori']] : [['NIP / ID', p.nip], ['Nomor absen', p.noAbsen], ['Jenis kelamin', p.jk === 'L' ? 'Laki-laki' : (p.jk === 'P' ? 'Perempuan' : p.jk)], ['Jabatan', p.jabatan], ['Status kerja', p.status], ['Tanggal masuk', p.tglMasuk ? dmy(p.tglMasuk) : '']]), true);
		if (!p.kategori) bagian('Data Pribadi', [['NIK', p.nik], ['Tempat lahir', p.tempatLahir], ['Tanggal lahir', p.tglLahir ? dmy(p.tglLahir) : ''], ['Nomor HP', p.noHp], ['Status BPJS / Ketenagakerjaan', p.kTk, true]], false);
		isi.appendChild(keteranganProfil);
	}).catch(function (e) { if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') { kotak.className = 'alert'; kotak.textContent = pesanError(e) + ' '; kotak.appendChild(btn('Coba lagi', 'kecil', function () { S.profilPromise = null; renderProfilSendiri(); })); isi.appendChild(keteranganProfil); } });
	}

	function renderDirektori() {
	var hak = hakDari('karyawan');
	if (!hak || !hak.lihat) { toast('Menu Data Karyawan belum diizinkan oleh admin.'); return; }
	var semua = hak.cakupan === 'semua';
	var lihatDivisi = hak.cakupan === 'divisi';
	var infoCakupan = semua ? 'Semua karyawan'
		: (lihatDivisi ? ('Divisi: ' + (hak.divisi && hak.divisi.length ? hak.divisi.join(', ') : 'divisi Anda sendiri'))
		: 'Data Anda sendiri');
	var isi = halaman('Data Karyawan', 'Direktori karyawan sesuai hak akses akun Anda (' + infoCakupan + ').');
	var daftar = [];
	var bisaEdit = bolehEdit('karyawan');
	var cari = (semua || lihatDivisi) ? el('input', { type: 'search', placeholder: 'Cari nama, divisi, NIP, atau kategori', 'aria-label': 'Cari data karyawan' }) : null;
	var count = el('p', { class: 'hitung loading', text: 'Memuat direktori' }), kotak = el('div');
	isi.appendChild(el('div', { class: 'toolbar' }, [cari, btn('Muat ulang', '', muat)]));
	isi.appendChild(count); isi.appendChild(kotak);
	function barisAksi(r) {
		var aksi = el('div', { class: 'baris-aksi direktori-actions' });
		function tombolAksi(label, kelas, ikonIsi, aksiKlik) {
		var b = btn('', 'kecil ' + kelas, aksiKlik);
		b.setAttribute('aria-label', label);
		b.title = label;
		b.appendChild(ikon(ikonIsi));
		b.appendChild(el('span', { class: 'direktori-action-label', text: label }));
		aksi.appendChild(b);
		}
		tombolAksi('Detail', 'aksi-detail', '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v.01M11 11v4"/>', function () { bukaDetailDirektoriAman(r); });
		tombolAksi('Cetak', 'aksi-cetak', '<path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h.01"/>', function () { cetakProfil(r); });
		if (bisaEdit) {
		var bisaEditIni = r.sumber !== 'penugasan' && (semua || lihatDivisi || (S.karyawan && S.karyawan.id === r.id));
		if (bisaEditIni) tombolAksi('Edit', 'aksi-edit', '<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>', function () { editDirektori(r); });
		}
		return aksi;
	}
	function kunciFotoDirektori(r) {
		var identitas = idFotoKaryawan(r) || 'akun';
		return 'hrd_avatar_karyawan_' + String(identitas).replace(/[^a-zA-Z0-9_-]/g, '_');
	}
	function kartuNamaDirektori(r) {
		var kotakNama = el('div', { class: 'direktori-name-cell' });
		var avatar = el('span', { class: 'direktori-row-avatar', 'aria-hidden': 'true' });
		var src = fotoServerKaryawan(r);
		if (!src) {
		try { src = localStorage.getItem(kunciFotoDirektori(r)) || ''; } catch (e) {}
		}
		if (src) avatar.appendChild(el('img', { src: src, alt: '' }));
		else avatar.textContent = String(r.nama || 'K').trim().charAt(0).toUpperCase() || 'K';
		var teks = el('div', { class: 'direktori-name-text' }, [
		el('strong', { text: r.nama || 'Nama belum tersedia' }),
		el('span', { class: 'sub2', text: (r.divisi || 'Tanpa divisi') + (r.kategori ? ' · ' + r.kategori : '') })
		]);
		kotakNama.appendChild(avatar);
		kotakNama.appendChild(teks);
		return kotakNama;
	}
	function gambar() {
		count.classList.remove('loading');
		var q = cari ? cari.value.trim().toLowerCase() : '';
		var rows = daftar.filter(function (r) { return !q || ['nama', 'divisi', 'nip', 'status', 'kategori'].some(function (k) { return String(r[k] || '').toLowerCase().indexOf(q) >= 0; }); });
		count.textContent = 'Menampilkan ' + rows.length + ' dari ' + daftar.length + ' orang' + (bisaEdit ? ' · perubahan perlu persetujuan admin' : '');
		kotak.innerHTML = ''; kotak.className = '';
		if (!rows.length) { kotak.className = 'kosong'; kotak.textContent = daftar.length ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada data yang dapat ditampilkan.'; return; }
		kotak.appendChild(tabel(['Nama karyawan', 'NIP', 'Status', 'Tindakan'], rows.map(function (r) {
		return [kartuNamaDirektori(r), r.nip, r.status, barisAksi(r)];
		})));
		Array.prototype.forEach.call(kotak.querySelectorAll('.tbl tbody tr'), function (tr, i) {
		tr.classList.add('karyawan-row');
		var selTindakan = tr.querySelector('td:last-child');
		if (selTindakan) {
			selTindakan.classList.add('direktori-action-cell');
			selTindakan.addEventListener('click', function (e) { e.stopPropagation(); });
			selTindakan.addEventListener('pointerenter', function () { tr.classList.add('action-hover'); });
			selTindakan.addEventListener('pointerleave', function () { tr.classList.remove('action-hover'); });
		}
		tr.addEventListener('click', function (e) {
			if (e.target.closest('.direktori-action-cell, button')) return;
			bukaDetailDirektoriAman(rows[i]);
		});
		});
	}
	async function muat() {
		try {
		var r = await api('karyawanDirektori');
		daftar = r.data || [];
		FOTO_DIREKTORI_SERVER = Object.create(null);
		var fotoPerId = r.fotoProfilById || r.fotoById || r.avatarById || r.fotoProfilData || {};
		if (fotoPerId && typeof fotoPerId === 'object' && !Array.isArray(fotoPerId)) {
			Object.keys(fotoPerId).forEach(function (id) {
			var foto = nilaiFotoKaryawan(fotoPerId[id]);
			if (foto) FOTO_DIREKTORI_SERVER[kunciIdFotoKaryawan(id)] = foto;
			});
		}
		daftar.forEach(function (karyawan) {
			var foto = nilaiFotoKaryawan(
			karyawan.fotoProfilData || karyawan.fotoProfil || karyawan.foto || karyawan.avatar
			);
			if (foto) daftarIdFotoKaryawan(karyawan).forEach(function (id) {
			FOTO_DIREKTORI_SERVER[kunciIdFotoKaryawan(id)] = foto;
			});
		});
		gambar();
		} catch (e) { if (pesanError(e) !== 'SESI_HABIS' && pesanError(e) !== 'PERMINTAAN_DIBATALKAN') { kotak.className = 'alert'; kotak.textContent = pesanError(e); } }
	}
	if (cari) cari.addEventListener('input', gambar);
	muat();
	}

	function editDirektori(r) {
	var f = {
		nama: el('input', { type: 'text', value: r.nama || '' }),
		nip: el('input', { type: 'text', value: r.nip || '' }),
		noAbsen: el('input', { type: 'text', value: r.noAbsen || '' }),
		jk: el('select'),
		divisi: el('input', { type: 'text', value: r.divisi || '' }),
		jabatan: el('input', { type: 'text', value: r.jabatan || '' }),
		status: el('input', { type: 'text', value: r.status || '' }),
		tglMasuk: el('input', { type: 'date', value: r.tglMasuk || '' }),
		keterangan: el('textarea', { rows: '3', value: r.keterangan || '' })
	};
	['', 'L', 'P'].forEach(function (v) { f.jk.appendChild(el('option', { value: v, text: v || 'Belum diisi' })); });
	f.jk.value = r.jk || '';
	var err = el('div', { class: 'alert hidden', role: 'alert' });
	var info = el('div', { class: 'info', text: 'Perubahan akan diajukan ke admin. Data tidak langsung berubah sampai disetujui.' });
	bukaModal('Ajukan Perubahan Data Karyawan', [
		el('div', { class: 'pf-top' }, [
		el('div', { class: 'avatar', text: String(r.nama || 'K').trim().charAt(0).toUpperCase() }),
		el('div', null, [el('h4', { text: r.nama || 'Karyawan' }), el('span', { class: 'chip', text: r.divisi || 'Tanpa divisi' })])
		]),
		info,
		el('div', { class: 'grid2' }, [fieldEl('Nama lengkap', f.nama), fieldEl('NIP', f.nip)]),
		el('div', { class: 'grid2' }, [fieldEl('No. absen', f.noAbsen), fieldEl('Jenis kelamin', f.jk)]),
		el('div', { class: 'grid2' }, [fieldEl('Divisi', f.divisi), fieldEl('Jabatan', f.jabatan)]),
		el('div', { class: 'grid2' }, [fieldEl('Status kerja', f.status), fieldEl('Tanggal masuk', f.tglMasuk)]),
		fieldEl('Keterangan', f.keterangan),
		err
	], [
		{ teks: 'Batal', klik: function (t) { t(); } },
		{ teks: 'Ajukan', kelas: 'primary', klik: async function (t, b) {
		b.disabled = true; b.textContent = 'Mengirim...';
		try {
			var data = {
			nama: f.nama.value, nip: f.nip.value, noAbsen: f.noAbsen.value,
			jk: f.jk.value, divisi: f.divisi.value, jabatan: f.jabatan.value,
			status: f.status.value, tglMasuk: f.tglMasuk.value, keterangan: f.keterangan.value
			};
			var res = await api('karyawanDirektoriEdit', { id: r.id, data: data });
			toast('Pengajuan terkirim: ' + res.idPengajuan + '. Menunggu persetujuan admin.');
			t();
		} catch (e) { err.textContent = pesanError(e); err.classList.remove('hidden'); }
		finally { b.disabled = false; b.textContent = 'Ajukan'; }
		} }
	]).box.classList.add('lebar');
	}

	function bukaZoomFotoDirektori(src, nama) {
	if (!src) { toast('Foto profil karyawan belum tersedia.'); return; }
	var overlay = el('div', { class: 'foto-profil-zoom-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Foto profil ' + nama });
	var dialog = el('div', { class: 'foto-profil-zoom-dialog' });
	var img = el('img', { class: 'foto-profil-zoom-img', src: src, alt: 'Foto profil ' + nama });
	var caption = el('div', { class: 'foto-profil-zoom-caption', text: nama });
	var close = el('button', { type: 'button', class: 'foto-profil-zoom-close', 'aria-label': 'Tutup foto', title: 'Tutup', text: '×' });
	function tutup() {
		if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
		document.removeEventListener('keydown', tombolEsc);
	}
	function tombolEsc(e) { if (e.key === 'Escape') tutup(); }
	close.addEventListener('click', tutup);
	overlay.addEventListener('click', function (e) { if (e.target === overlay) tutup(); });
	dialog.addEventListener('click', function (e) { e.stopPropagation(); });
	dialog.appendChild(close); dialog.appendChild(img); dialog.appendChild(caption); overlay.appendChild(dialog);
	document.body.appendChild(overlay);
	document.addEventListener('keydown', tombolEsc);
	close.focus();
	}

	// Empat field terbatas hanya terlihat jika akun memiliki hak edit menu Data Karyawan
	// dan karyawan yang dibuka masih berstatus aktif.
	function bolehLihatFieldTerbatasDirektori(r) {
	return !!r && r.sumber !== 'penugasan' && bolehEdit('karyawan') && !karyawanNonaktifPabrik(r);
	}
	function detailDirektori(r) {
	var tampilkanFieldTerbatas = bolehLihatFieldTerbatasDirektori(r);
	var nama = String(r.nama || 'Nama belum tersedia');
	var inisial = nama.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0); }).join('').toUpperCase();
	var sumberFoto = fotoServerKaryawan(r);
	var identitasFoto = idFotoKaryawan(r) || 'akun';
	var kunciFoto = 'hrd_avatar_karyawan_' + String(identitasFoto).replace(/[^a-zA-Z0-9_-]/g, '_');
	var fotoLokal = '';
	try { fotoLokal = localStorage.getItem(kunciFoto) || ''; } catch (e) {}
	var foto = sumberFoto || fotoLokal;
	var avatar = el('div', { class: 'avatar foto-direktori-klik', tabindex: '0', role: 'button', 'aria-label': 'Perbesar foto profil ' + nama, title: 'Klik untuk memperbesar foto', style: 'width:76px;height:76px;overflow:hidden;padding:0' });
	function tampilFoto(src) {
		avatar.innerHTML = '';
		if (src) avatar.appendChild(el('img', { src: src, alt: 'Foto profil ' + nama, style: 'width:100%;height:100%;object-fit:cover;border-radius:inherit' }));
		else avatar.textContent = inisial || 'K';
		avatar.setAttribute('aria-label', src ? 'Perbesar foto profil ' + nama : 'Foto profil ' + nama + ' belum tersedia');
		avatar.title = src ? 'Klik untuk memperbesar foto' : 'Foto profil belum tersedia';
	}
	tampilFoto(foto);
	avatar.addEventListener('click', function () { bukaZoomFotoDirektori(foto, nama); });
	avatar.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bukaZoomFotoDirektori(foto, nama); }
	});
	var dl = el('dl', { class: 'pf' });
	var fieldsDetail = [['NIP / ID', r.nip], ['Divisi', r.divisi], ['Jabatan', r.jabatan],
		['Jenis kelamin', r.jk === 'L' ? 'Laki-laki' : (r.jk === 'P' ? 'Perempuan' : r.jk)], ['Status kerja', r.status],
		['Status di pabrik', karyawanNonaktifPabrik(r) ? 'Nonaktif' : 'Aktif'], ['Tanggal masuk', r.tglMasuk ? dmy(r.tglMasuk) : ''],
		['Lama kerja', lamaKerja(r.tglMasuk, karyawanNonaktifPabrik(r) ? r.tglNonaktif : '')], ['Keterangan', r.keterangan]];
	if (r.sumber === 'penugasan') {
		fieldsDetail = fieldsDetail.filter(function (f) { return f[0] !== 'Tanggal masuk' && f[0] !== 'Lama kerja'; });
		fieldsDetail.splice(0, 0, ['Kategori tenaga', r.kategori]);
		fieldsDetail.splice(6, 0,
		['Tanggal mulai penugasan', r.tglMulai ? dmy(r.tglMulai) : ''],
		['Tanggal selesai penugasan', r.tglSelesai ? dmy(r.tglSelesai) : '']);
	}
	if (tampilkanFieldTerbatas) {
		fieldsDetail.splice(1, 0, ['Nomor absen', r.noAbsen]);
		fieldsDetail.splice(fieldsDetail.length - 1, 0,
		['Tanggal nonaktif', r.tglNonaktif ? dmy(r.tglNonaktif) : ''],
		['Alasan nonaktif', r.alasan], ['Tujuan', r.tujuan]);
	}
	var judulDisembunyikan = ['Tanggal nonaktif', 'Alasan nonaktif', 'Tujuan'];
	fieldsDetail = fieldsDetail.filter(function (f) { return judulDisembunyikan.indexOf(f[0]) < 0; });
	fieldsDetail.forEach(function (f) { dl.appendChild(el('div', null, [el('dt', { text: f[0] }), el('dd', { text: String(f[1] || '') })])); });
	bukaModal('Detail Karyawan', [
		el('div', { class: 'pf-top' }, [avatar, el('div', { class: 'pf-identity-name' }, [el('h4', { text: nama }), el('span', { class: 'chip', text: r.divisi || 'Tanpa divisi' })])]),
		el('p', { class: 'sub2', text: 'Data pribadi sensitif (NIK, tanggal lahir, nomor HP) tidak ditampilkan.' }), dl
	], [{ teks: 'Tutup', kelas: 'primary', klik: function (t) { t(); } }]).box.classList.add('lebar');
	}
	function bukaDetailDirektoriAman(r) {
	try {
		detailDirektori(r);
	} catch (e) {
		var data = r || {};
		var fields = [
		['Nama lengkap', data.nama], ['NIP / ID', data.nip],
		['Divisi', data.divisi], ['Jabatan', data.jabatan], ['Status kerja', data.status],
		['Tanggal masuk', data.tglMasuk ? dmy(data.tglMasuk) : ''], ['Keterangan', data.keterangan]
		];
		if (bolehLihatFieldTerbatasDirektori(data)) fields.splice(2, 0, ['Nomor absen', data.noAbsen]);
		var daftar = el('dl', { class: 'pf' });
		fields.forEach(function (f) {
		daftar.appendChild(el('div', null, [el('dt', { text: f[0] }), el('dd', { text: String(f[1] || '?') })]));
		});
		bukaModal('Detail Karyawan', [daftar], [
		{ teks: 'Tutup', kelas: 'primary', klik: function (t) { t(); } }
		]).box.classList.add('lebar');
		toast('Detail dibuka dengan tampilan ringkas karena sebagian data tidak dapat dimuat.');
	}
	}
	function cetakProfil(r) {
	var w = window.open('', '_blank', 'width=800,height=700');
	if (!w) { toast('Izinkan pop-up untuk mencetak profil karyawan.'); return; }
	var tampilkanFieldTerbatas = bolehLihatFieldTerbatasDirektori(r);
	var fields = [['Nama lengkap', r.nama], ['NIP / ID', r.nip], ['Divisi', r.divisi], ['Jabatan', r.jabatan],
		['Jenis kelamin', r.jk === 'L' ? 'Laki-laki' : (r.jk === 'P' ? 'Perempuan' : r.jk)], ['Status kerja', r.status],
		['Status di pabrik', karyawanNonaktifPabrik(r) ? 'Nonaktif' : 'Aktif'], ['Tanggal masuk', r.tglMasuk ? dmy(r.tglMasuk) : ''],
		['Lama kerja', lamaKerja(r.tglMasuk, karyawanNonaktifPabrik(r) ? r.tglNonaktif : '')], ['Keterangan', r.keterangan]];
	if (r.sumber === 'penugasan') {
		fields = fields.filter(function (f) { return f[0] !== 'Tanggal masuk' && f[0] !== 'Lama kerja'; });
		fields.splice(1, 0, ['Kategori tenaga', r.kategori]);
		fields.splice(7, 0,
		['Tanggal mulai penugasan', r.tglMulai ? dmy(r.tglMulai) : ''],
		['Tanggal selesai penugasan', r.tglSelesai ? dmy(r.tglSelesai) : '']);
	}
	if (tampilkanFieldTerbatas) {
		fields.splice(2, 0, ['Nomor absen', r.noAbsen]);
		fields.splice(fields.length - 1, 0,
		['Tanggal nonaktif', r.tglNonaktif ? dmy(r.tglNonaktif) : ''],
		['Alasan nonaktif', r.alasan], ['Tujuan', r.tujuan]);
	}
	var trs = fields.map(function (f) { return '<tr><th>' + esc(f[0]) + '</th><td>' + esc(f[1]) + '</td></tr>'; }).join('');
	w.document.open();
	w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Profil Karyawan</title><style>body{font:14px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#222;margin:32px}h1{font-size:21px;margin-bottom:4px}p{color:#555}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #bbb;padding:10px;text-align:left}th{width:32%;background:#f1f4f6}</style></head><body><h1>PROFIL KARYAWAN</h1><p>PT Raja Palma — Portal Karyawan</p><table>' + trs + '</table><p style="margin-top:30px;font-size:11px">Dicetak pada ' + esc(new Date().toLocaleString('id-ID')) + '</p></body></html>');
	w.document.close(); w.focus();
	setTimeout(function () { w.print(); }, 300);
	}

	var absTabK = 'cek';
	var absHomeK = true;
	function renderAbsensiKaryawan() {
	var hak = hakDari('absensi');
	if (!hak.tambah) absTabK = 'cek';
	if (absHomeK) {
		var isiHome = halaman('Absensi', 'Pilih fitur absensi yang ingin dibuka.');
		var pilihan = el('div', { class: 'abs-home-grid' });
		pilihan.appendChild(kartuPilihanAbsensi('Cek Absensi', 'Lihat riwayat kehadiran dan lembur milik Anda.', 'cek', IKON.absensi, function () { absTabK = 'cek'; absHomeK = false; renderAbsensiKaryawan(); }));
		if (hak.tambah) pilihan.appendChild(kartuPilihanAbsensi('Input Absensi', 'Catat kehadiran dinas luar dengan foto bukti.', 'input', IKON.kamera, function () { absTabK = 'dinas'; absHomeK = false; renderAbsensiKaryawan(); }));
		isiHome.appendChild(pilihan);
		return;
	}
	var isi = halaman('Absensi', 'Periksa riwayat kehadiran' + (hak.tambah ? ' atau catat absensi dinas luar.' : ' pribadi Anda.'));
	if (hak.tambah) {
		var tabs = el('div', { class: 'tabs' });
		[['cek', 'Cek Absensi'], ['dinas', 'Absen Dinas Luar']].forEach(function (t) {
		tabs.appendChild(btn(t[1], absTabK === t[0] ? 'primary' : '', function () { absTabK = t[0]; renderAbsensiKaryawan(); }));
		});
		isi.appendChild(tabs);
	}
	 if (absTabK === 'dinas') absDinasKaryawan(isi);
  else {
    var tunggu = el('div', { class: 'info loading', text: 'Memuat kalender kerja' });
    isi.appendChild(tunggu);
    muatLiburProduksi(true).then(function () {
      if (!tunggu.isConnected) return;          // pengguna sudah pindah halaman
      tunggu.remove();
      absCekKaryawan(isi);
    }).catch(function () {});
  }
	}
	// Libur nasional & cuti bersama 2026 (SKB 3 Menteri). Tambah/ubah tanggal di sini bila ada perubahan atau tahun baru.
	var LIBUR_NASIONAL = {'2026-01-01':'Tahun Baru Masehi','2026-01-16':'Isra Mikraj','2026-02-17':'Tahun Baru Imlek','2026-03-19':'Hari Suci Nyepi','2026-03-21':'Idul Fitri 1447 H','2026-03-22':'Idul Fitri 1447 H','2026-04-03':'Wafat Yesus Kristus','2026-04-05':'Paskah','2026-05-01':'Hari Buruh','2026-05-14':'Kenaikan Yesus Kristus','2026-05-27':'Idul Adha','2026-05-31':'Hari Raya Waisak','2026-06-01':'Hari Lahir Pancasila','2026-06-16':'Tahun Baru Islam 1448 H','2026-08-17':'Hari Kemerdekaan RI','2026-08-25':'Maulid Nabi','2026-12-25':'Hari Raya Natal'};
	var CUTI_BERSAMA = {'2026-02-16':'Cuti Bersama Imlek','2026-03-18':'Cuti Bersama Nyepi','2026-03-20':'Cuti Bersama Idul Fitri','2026-03-23':'Cuti Bersama Idul Fitri','2026-03-24':'Cuti Bersama Idul Fitri','2026-05-15':'Cuti Bersama Kenaikan Yesus Kristus','2026-05-28':'Cuti Bersama Idul Adha','2026-12-24':'Cuti Bersama Natal'};
	function absCekKaryawan(isi) {
  var hak = hakDari('absensi'), lintas = hak.cakupan === 'semua' || hak.cakupan === 'divisi';
  var now = new Date(), bulan = new Date(now.getFullYear(), now.getMonth(), 1);
  var data = [], dipilih = '', akhirDipilih = '', cache = {}, cacheBulanPenuh = {}, reqId = 0;
  var muatAwal = true, rentangAwal = null;
  var idxAktif = {}, kalenderKunciRender = '', kalenderDataRender = null;
  var lemburIdx = null, lemburMuat = false, bisaLihatLembur = !!hakDari('lembur').lihat;
  var filterKat = '';                       // filter status dari kotak statistik
  var rentangData = null;                   // rentang tanggal yang benar-benar sudah dimuat
  var rosterData = [], rosterVer = 0, rosterMuat = false;
  var JAM_ALPA_HARI_INI = 18;               // hari ini baru dihitung Alpha setelah jam ini
  var BUAT_BARIS_OFF = true;                // true: hari OFF tanpa catatan ditampilkan sebagai baris "OFF"
  var KATEGORI = ['hadir', 'izin', 'dinas', 'alpa', 'anomali', 'off'];
  var LBL = { hadir: 'Hadir', izin: 'Sakit / Izin', dinas: 'Dinas luar', alpa: 'Alpha', anomali: 'Belum lengkap', off: 'OFF Produksi' };
  var BLN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  var cari = el('input', { type: 'search', placeholder: 'Cari nama atau nomor absen pada tanggal ini…', 'aria-label': 'Cari nama atau nomor absen pada tanggal ini' });
  var cariTimer = null;
  var judul = el('strong', { class: 'abs-kal-month' });
  var grid = el('div', { class: 'abs-kal-grid', role: 'grid', 'aria-label': 'Kalender absensi bulanan' });
  var detail = el('section', { class: 'abs-kal-detail hidden' });
  var stat = el('div', { class: 'abs-kal-stats' });
  var loading = el('div', { class: 'info loading', text: 'Memuat data absensi…' });
  var bar = el('div', { class: 'abs-kal-toolbar hidden' }, [cari]);
  var prev = btn('‹', 'abs-kal-nav', function () { geser(-1); });
  var next = btn('›', 'abs-kal-nav', function () { geser(1); });
  prev.setAttribute('aria-label', 'Bulan sebelumnya'); next.setAttribute('aria-label', 'Bulan berikutnya');
  var kini = btn('Bulan ini', 'kecil', function () { bulan = new Date(now.getFullYear(), now.getMonth(), 1); muat(); });
  var head = el('div', { class: 'abs-kal-head' }, [prev, el('div', { class: 'abs-kal-title' }, [judul, kini]), next]);
  var minggu = el('div', { class: 'abs-kal-week' });
  ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(function (h) { minggu.appendChild(el('span', { text: h })); });
  var infoCakupan = 'Data absensi sesuai hak akses akun Anda. Hari Off produksi dan maintenance ditandai OFF (bukan Alpha). Hari Minggu dan libur dikosongkan.';
  var info = el('p', { class: 'sub2 abs-kal-info', text: infoCakupan });
  var peringatan = el('div', { class: 'alert hidden', role: 'alert' });
  var legenda = el('div', { class: 'abs-kal-legend', 'aria-label': 'Keterangan warna status' }, KATEGORI.map(function (k) {
    return el('span', { class: 'abs-kal-legend-item' }, [el('i', { class: k }), LBL[k]]);
  }));
  var wadah = el('div', { class: 'abs-kal-wrap' }, [head, stat, minggu, grid, legenda, info, peringatan, bar, detail]);
  isi.appendChild(wadah); isi.appendChild(loading);

  /* ---------- util ---------- */
  function ym(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1); }
  function geser(n) { bulan = new Date(bulan.getFullYear(), bulan.getMonth() + n, 1); muat(); }
  function aturBar() { bar.classList.toggle('hidden', !lintas || !(dipilih || filterKat)); }
  function tglISO(v) {
    var t = String(v || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
    var m = t.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    return m ? m[3] + '-' + p2(m[2]) + '-' + p2(m[1]) : t.slice(0, 10);
  }
  function tglTeks(iso) { var a = iso.split('-'); return Number(a[2]) + ' ' + (BLN[Number(a[1]) - 1] || a[1]) + ' ' + a[0]; }
  function ketLibur(t) { return LIBUR_NASIONAL[t] || CUTI_BERSAMA[t] || ''; }
  function adaAturanOff(t) { return (OFF_STATE.aturan || []).some(function (o) { return o && o.tanggal === t && o.jenis !== 'libur'; }); }
  function ketHari(t) { return [ketLibur(t)].concat(ringkasOffProduksi(t)).filter(Boolean).join(' · '); }
  function batasDipilih() { return !dipilih ? null : (dipilih <= akhirDipilih ? [dipilih, akhirDipilih] : [akhirDipilih, dipilih]); }
  function dalamRentang(t, batas) { return !!batas && t >= batas[0] && t <= batas[1]; }
  function kunciLembur(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
  function divisiOrang(noAbsen) { return OFF_STATE.divisiByNo[kunciNoAbsen(noAbsen)] || ''; }
  function karDari(x) {
    var div = x.divisi || divisiOrang(x.noAbsen);
    if (!div && !lintas && S.karyawan) div = S.karyawan.divisi || '';
    return { noAbsen: x.noAbsen, divisi: div };
  }

  /* ---------- kategori status ---------- */
  function kategori(x) {
    if (x._kat) return x._kat;                                  // baris virtual (Alpha / OFF) sudah pasti
    var s = String(x.status || '').toLowerCase(), g = s + ' ' + String(x.keterangan || '').toLowerCase();
    var adaScan = !!(x.jamMasuk || x.jamPulang);
    function polaLibur() {                                       // hanya untuk baris TANPA scan
      if (adaScan) return null;
      if (infoHariOff(tglISO(x.tanggal), karDari(x))) return 'off';             // Off produksi -> kategori OFF
      return infoLiburRutin(tglISO(x.tanggal), karDari(x)) ? 'kosong' : null;   // Minggu / libur -> dikosongkan
    }
    if (/dinas\s*luar|luar\s*dinas/.test(g)) return 'dinas';
    if (/izin|sakit|cuti/.test(g)) return 'izin';
    if (/\b(off|libur|maintenance|maintenence|shutdown)\b/.test(s)) return polaLibur() === 'kosong' ? 'kosong' : 'off';
    if (/alpa|alpha|tanpa keterangan|tidak hadir/.test(g)) return polaLibur() || 'alpa';
    if (/anomali|belum lengkap|tidak lengkap|scan kurang|belum scan/.test(g)) return polaLibur() || 'anomali';
    if (adaScan || /hadir|masuk|pulang/.test(s)) return 'hadir';
    return polaLibur() || 'anomali';
  }

  /* ---------- karyawan + baris virtual (Alpha / OFF) ---------- */
  function buatKar(nama, noAbsen, mulai, selesai, divisi) {
    return { nama: nama || '', noAbsen: noAbsen || '', a: kunciNoAbsen(noAbsen), n: kunciLembur(nama), mulai: mulai || '', selesai: selesai || '', divisi: divisi || '' };
  }
  function muatRoster() {
    if (!lintas || rosterMuat) return;
    rosterMuat = true;
    if (!hakDari('karyawan').lihat) { rosterVer++; return; }
    api('karyawanDirektori').then(function (r) {
      rosterData = [];
      ((r && r.data) || []).forEach(function (k) {
        var nonaktif = karyawanNonaktifPabrik(k), penugasan = k.sumber === 'penugasan';
        var selesai = tglISO(penugasan ? k.tglSelesai : (nonaktif ? k.tglNonaktif : ''));
        if (nonaktif && !penugasan && !selesai) return;   // nonaktif tanpa tanggal: jangan dihitung
        rosterData.push(buatKar(k.nama, k.noAbsen, tglISO(penugasan ? k.tglMulai : k.tglMasuk), selesai, k.divisi || divisiOrang(k.noAbsen)));
      });
      rosterVer++; gambar();
    }).catch(function () { rosterVer++; gambar(); });
  }
  function daftarKaryawan() {
    if (!lintas) {
      var s = S.karyawan || {}, no = s.noAbsen || s.no_absen;
      return [buatKar(s.nama, no, tglISO(s.tglMasuk), '', divisiOrang(no) || s.divisi || '')];
    }
    var daftar = rosterData.slice(), ada = {}, awal = {};
    rosterData.forEach(function (k) { if (k.a) ada['a:' + k.a] = 1; if (k.n) ada['n:' + k.n] = 1; });
    data.forEach(function (x) {
      var a = kunciNoAbsen(x.noAbsen), n = kunciLembur(x.nama), key = a ? 'a:' + a : (n ? 'n:' + n : '');
      if (!key) return;
      var t = tglISO(x.tanggal);
      if (!awal[key] || t < awal[key]) awal[key] = t;
    });
    data.forEach(function (x) {
      var a = kunciNoAbsen(x.noAbsen), n = kunciLembur(x.nama), key = a ? 'a:' + a : (n ? 'n:' + n : '');
      if (!key || (a && ada['a:' + a]) || (n && ada['n:' + n])) return;
      if (a) ada['a:' + a] = 1; if (n) ada['n:' + n] = 1;
      daftar.push(buatKar(x.nama, x.noAbsen, awal[key], '', divisiOrang(x.noAbsen)));   // hanya terlihat di data: mulai dari catatan pertamanya
    });
    return daftar;
  }
  function barisVirtual(k, t, kat, ket) {
    return { tanggal: t, nama: k.nama, noAbsen: k.noAbsen, divisi: k.divisi, status: ket || 'Tidak ada catatan absensi', keterangan: '', _virtual: true, _kat: kat, _ket: ket || '' };
  }
  function hitungVirtual(idxAsli) {
    var out = {};
    if (!rentangData) return out;                                  // data belum selesai dimuat
    var y = bulan.getFullYear(), m = bulan.getMonth(), n = new Date(y, m + 1, 0).getDate();
    var sekarang = new Date(), hariIni = isoHari(sekarang), tunda = sekarang.getHours() < JAM_ALPA_HARI_INI;
    var daftar = daftarKaryawan();
    for (var d = 1; d <= n; d++) {
      var t = y + '-' + p2(m + 1) + '-' + p2(d);
      if (t < rentangData.dari || t > rentangData.sampai) continue;
      // Alpha hanya dihitung bila jadwal Off berhasil dimuat DAN harinya sudah lewat.
      var bolehAlpa = OFF_STATE.siap && (t < hariIni || (t === hariIni && !tunda));
      var rs = idxAsli[t] || [], hadir = {};
      if (lintas) rs.forEach(function (x) {
        var a = kunciNoAbsen(x.noAbsen), nm = kunciLembur(x.nama);
        if (a) hadir['a:' + a] = 1; if (nm) hadir['n:' + nm] = 1;
      });
      daftar.forEach(function (k) {
        if ((k.mulai && t < k.mulai) || (k.selesai && t > k.selesai)) return;      // belum masuk / sudah nonaktif
        var punya = lintas ? !!((k.a && hadir['a:' + k.a]) || (k.n && hadir['n:' + k.n])) : rs.length > 0;
        if (punya) return;                                                          // sudah ada catatan nyata
        var off = infoHariOff(t, k);
        if (off) { if (BUAT_BARIS_OFF) (out[t] = out[t] || []).push(barisVirtual(k, t, 'off', off.ket)); return; }
        if (infoLiburRutin(t, k)) return;                                           // Minggu / libur: kosongkan (bukan OFF, bukan Alpha)
        if (bolehAlpa) (out[t] = out[t] || []).push(barisVirtual(k, t, 'alpa', ''));
      });
    }
    return out;
  }

  /* ---------- lembur ---------- */
  function muatLembur() {
    if (lemburMuat || !bisaLihatLembur) return;
    lemburMuat = true;
    api('karyawanLembur').then(function (r) {
      var idx = { noAbsen: {}, nama: {}, semua: {} };
      ((r && r.data) || []).forEach(function (row) {
        (row.rincian_harian || []).forEach(function (h) {
          var t = tglISO(h.tanggal), j = Number(h.jam) || 0;
          if (!t || j <= 0) return;
          [['noAbsen', kunciLembur(row.no_absen)], ['nama', kunciLembur(row.nama)], ['semua', '*']].forEach(function (p) {
            if (!p[1]) return;
            var mm = idx[p[0]];
            mm[p[1]] = mm[p[1]] || {};
            mm[p[1]][t] = (mm[p[1]][t] || 0) + j;
          });
        });
      });
      lemburIdx = idx;
      if (dipilih) gambar();
    }).catch(function () {
      lemburMuat = false;
      lemburIdx = false;
      if (dipilih) gambar();
    });
  }
  function lemburDi(x, t) {
    if (!lemburIdx) return null;
    var m = null, k = kunciLembur(x.noAbsen);
    if (lintas) {
      if (k && lemburIdx.noAbsen[k]) m = lemburIdx.noAbsen[k];
      else { k = kunciLembur(x.nama); if (k && lemburIdx.nama[k]) m = lemburIdx.nama[k]; }
    } else m = lemburIdx.semua['*'];
    return m && m[t] ? Number(m[t].toFixed(2)) : null;
  }
  function nilaiLembur(x, t) {
    if (x._virtual) return '';
    var asli = x.lembur, kosong = asli == null || asli === '' || Number(asli) === 0;
    if (!kosong) return asli;
    var j = lemburDi(x, t);
    if (j) return j;
    if (lemburIdx === null && bisaLihatLembur) return 'Memuat…';
    return asli;
  }

  /* ---------- tampilan ---------- */
  function aturPeringatan() {
    peringatan.innerHTML = '';
    peringatan.classList.toggle('hidden', !OFF_STATE.gagal);
    if (!OFF_STATE.gagal) return;
    peringatan.appendChild(el('span', { text: 'Jadwal Off produksi / maintenance belum dapat dimuat, jadi status Alpha sementara tidak dihitung agar tidak keliru. ' }));
    peringatan.appendChild(btn('Muat ulang jadwal', 'kecil', function () {
      muatLiburProduksi(true).then(function () { kalenderKunciRender = ''; gambar(); }).catch(function () {});
    }));
  }
  function tampilDetail(idx) {
    detail.innerHTML = '';
    aturBar();
    if (!dipilih && !filterKat) { detail.classList.add('hidden'); return; }
    detail.classList.remove('hidden');
    muatLembur();
    var batas = batasDipilih(), semuaRs = [];
    var tanggalDetail = Object.keys(idx).filter(function (t) { return !batas || dalamRentang(t, batas); }).sort();
    tanggalDetail.forEach(function (t) {
      idx[t].forEach(function (x) {
        var k = kategori(x);
        if (!filterKat || k === filterKat) semuaRs.push({ data: x, tanggal: t, kat: k });
      });
    });
    // Baris OFF ditaruh paling akhir agar tidak menutupi catatan penting pada batas tampilan.
    semuaRs.sort(function (a, b) {
      return ((a.kat === 'off' ? 1 : 0) - (b.kat === 'off' ? 1 : 0)) || (a.tanggal < b.tanggal ? -1 : (a.tanggal > b.tanggal ? 1 : 0));
    });
    var q = lintas ? cari.value.trim().toLowerCase() : '';
    var rs = semuaRs.filter(function (item) {
      var x = item.data;
      return !q || String(x.nama || '').toLowerCase().indexOf(q) >= 0 || String(x.noAbsen || '').toLowerCase().indexOf(q) >= 0;
    });
    var labelTanggal = !batas ? judul.textContent : (batas[0] === batas[1] ? tglTeks(batas[0]) : tglTeks(batas[0]) + ' – ' + tglTeks(batas[1]));
    var eyebrow = !batas ? 'DETAIL BULAN INI' : (batas[0] === batas[1] ? 'DETAIL TANGGAL' : 'DETAIL RENTANG TANGGAL');
    if (filterKat) eyebrow += ' · FILTER: ' + LBL[filterKat].toUpperCase();
    var aksiDetail = [el('span', { class: 'abs-kal-count', text: rs.length + ' dari ' + semuaRs.length + ' catatan' })];
    if (dipilih) aksiDetail.push(btn('Hapus pilihan', 'kecil abs-kal-clear', function () { dipilih = ''; akhirDipilih = ''; gambar(); }));
    if (filterKat) aksiDetail.push(btn('Hapus filter', 'kecil abs-kal-clear', function () { filterKat = ''; gambar(); }));
    detail.appendChild(el('div', { class: 'abs-kal-detail-head' }, [el('div', null, [el('span', { class: 'abs-kal-eyebrow', text: eyebrow }), el('h3', { text: labelTanggal })]), el('div', { class: 'abs-kal-detail-actions' }, aksiDetail)]));
    if (batas && batas[0] === batas[1]) {
      var catatanHari = [];
      if (ketLibur(batas[0])) catatanHari.push((LIBUR_NASIONAL[batas[0]] ? 'Libur nasional: ' : '') + ketLibur(batas[0]));
      ringkasOffProduksi(batas[0]).forEach(function (r) { catatanHari.push('Off produksi: ' + r); });
      catatanHari.forEach(function (tks) { detail.appendChild(el('p', { class: 'abs-kal-note', text: tks })); });
    }
    if (!rs.length) {
      var kosongTeks = semuaRs.length ? 'Tidak ada hasil yang cocok dengan pencarian.'
        : (filterKat ? 'Tidak ada catatan berstatus ' + LBL[filterKat] + ' pada ' + (batas ? 'rentang tanggal ini.' : 'bulan ini.') : 'Belum ada catatan absensi pada rentang tanggal ini.');
      detail.appendChild(el('p', { class: 'abs-kal-empty', text: kosongTeks }));
      return;
    }
    var BATAS_KARTU = 300;
    rs.slice(0, BATAS_KARTU).forEach(function (item) {
      var x = item.data, k = item.kat, kartu = el('article', { class: 'abs-kal-record' });
      var tampilTanggal = !batas || batas[0] !== batas[1];
      kartu.appendChild(el('div', { class: 'abs-kal-record-top' }, [el('strong', { text: (lintas ? ((x.nama || 'Karyawan') + (x.noAbsen ? ' · No. absen ' + x.noAbsen : '')) : 'Absensi Anda') + (tampilTanggal ? ' · ' + tglTeks(item.tanggal) : '') }), el('span', { class: 'abs-kal-pill ' + k, text: LBL[k] })]));
      if (x._virtual) {
        kartu.appendChild(el('p', { class: 'abs-kal-note', text: x._ket || 'Tidak ada catatan absensi pada hari kerja ini.' }));
      } else {
        var meta = el('div', { class: 'abs-kal-meta' });
        [['Masuk', x.jamMasuk], ['Pulang', x.jamPulang], ['Lembur', nilaiLembur(x, item.tanggal)]].forEach(function (f) { meta.appendChild(el('div', null, [el('span', { text: f[0] }), el('strong', { text: String(f[1] == null || f[1] === '' ? '—' : f[1]) })])); });
        kartu.appendChild(meta);
        if (x.status) kartu.appendChild(el('p', { class: 'abs-kal-note', text: 'Status sumber: ' + x.status }));
        if (k === 'off') {
          var oi = infoHariOff(item.tanggal, karDari(x));
          if (oi) kartu.appendChild(el('p', { class: 'abs-kal-note', text: 'Dihitung OFF (bukan Alpha): ' + oi.ket }));
        }
      }
      detail.appendChild(kartu);
    });
    if (rs.length > BATAS_KARTU) detail.appendChild(el('p', { class: 'abs-kal-note', text: 'Menampilkan ' + BATAS_KARTU + ' catatan pertama. Persempit dengan pencarian atau pilih tanggal.' }));
  }
  function gambar() {
    var idxAsli = {}, idx = {}, c = { hadir: 0, izin: 0, dinas: 0, alpa: 0, anomali: 0, off: 0 }, batas = batasDipilih(), katTgl = {};
    data.forEach(function (x) { var t = tglISO(x.tanggal); (idxAsli[t] = idxAsli[t] || []).push(x); });
    var virt = hitungVirtual(idxAsli);
    Object.keys(idxAsli).forEach(function (t) { idx[t] = idxAsli[t].slice(); });
    Object.keys(virt).forEach(function (t) { idx[t] = (idx[t] || []).concat(virt[t]); });
    Object.keys(idx).forEach(function (t) { idx[t] = idx[t].filter(function (x) { return kategori(x) !== 'kosong'; }); if (!idx[t].length) delete idx[t]; });   // hari libur rutin tanpa scan: dikosongkan
    Object.keys(idx).forEach(function (t) {
      idx[t].forEach(function (x) {
        var k = kategori(x);
        (katTgl[t] = katTgl[t] || {})[k] = true;
        if (!batas || dalamRentang(t, batas)) c[k]++;
      });
    });
    var y = bulan.getFullYear(), m = bulan.getMonth(), n = new Date(y, m + 1, 0).getDate(), off = new Date(y, m, 1).getDay();
    judul.textContent = BLN[m] + ' ' + y;
    stat.innerHTML = '';
    [['Hadir', 'hadir'], ['Sakit / Izin', 'izin'], ['Dinas luar', 'dinas'], ['Alpha', 'alpa'], ['Belum lengkap', 'anomali'], ['OFF Produksi', 'off']].forEach(function (a) {
      var aktif = filterKat === a[1];
      var kotak = el('button', { type: 'button', class: 'abs-kal-stat ' + a[1] + (aktif ? ' aktif' : ''), 'aria-pressed': String(aktif), title: aktif ? 'Klik untuk menghapus filter' : 'Klik untuk menyaring: ' + a[0] }, [el('strong', { text: String(c[a[1]]) }), el('span', { text: a[0] })]);
      kotak.addEventListener('click', function () { filterKat = filterKat === a[1] ? '' : a[1]; gambar(); });
      stat.appendChild(kotak);
    });
    aturPeringatan();
    idxAktif = idx;
    var kunciBulan = ym(bulan);
    var kunciKal = kunciBulan + '|' + rosterVer + '|' + OFF_STATE.ver + '|' + (rentangData ? rentangData.dari + '~' + rentangData.sampai : '-');
    if (kalenderKunciRender !== kunciKal || kalenderDataRender !== data) {
      var fr = document.createDocumentFragment(), i;
      for (i = 0; i < off; i++) fr.appendChild(el('div', { class: 'abs-kal-cell kosong', 'aria-hidden': 'true' }));
      for (i = 1; i <= n; i++) (function (d) {
        var t = y + '-' + p2(m + 1) + '-' + p2(d), rs = idx[t] || [], dow = new Date(y, m, d).getDay(), kl = ketHari(t);
        var merah = dow === 0 || !!LIBUR_NASIONAL[t];
        var cls = 'abs-kal-cell' + (rs.length ? ' has-data' : '') + (merah ? ' merah' : (CUTI_BERSAMA[t] ? ' cuti' : '')) + (adaAturanOff(t) ? ' off-prod' : '');
        var b = el('button', { type: 'button', class: cls, 'data-tanggal': t, title: kl, 'aria-label': tglTeks(t) + (kl ? ', ' + kl : '') + ', ' + rs.length + ' catatan' });
        b.appendChild(el('strong', { class: 'abs-kal-day', text: String(d) }));
        if (rs.length) {
          var dots = el('span', { class: 'abs-kal-dots' }), jenis = {};
          rs.forEach(function (x) { jenis[kategori(x)] = true; });
          KATEGORI.forEach(function (k) { if (jenis[k]) dots.appendChild(el('i', { class: k })); });
          b.appendChild(dots);
        }
        b.addEventListener('click', function () {
          if (!dipilih) { dipilih = t; akhirDipilih = t; }
          else if (dipilih === akhirDipilih) {
            if (t === dipilih) { dipilih = ''; akhirDipilih = ''; }
            else akhirDipilih = t;
          } else { dipilih = t; akhirDipilih = t; }
          if (dipilih && rentangAwal && t < rentangAwal.dari && !cacheBulanPenuh[kunciBulan]) {
            muatBulanPenuh(kunciBulan);
          } else gambar();
          if (dipilih) detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
        fr.appendChild(b);
      })(i);
      for (i = 0; i < (7 - ((off + n) % 7)) % 7; i++) fr.appendChild(el('div', { class: 'abs-kal-cell kosong', 'aria-hidden': 'true' }));
      grid.replaceChildren(fr);
      kalenderKunciRender = kunciKal;
      kalenderDataRender = data;
    }
    Array.prototype.forEach.call(grid.querySelectorAll('.abs-kal-cell[data-tanggal]'), function (sel) {
      var t = sel.getAttribute('data-tanggal');
      var cocok = !!filterKat && !!(katTgl[t] && katTgl[t][filterKat]);
      sel.classList.toggle('range', dalamRentang(t, batas));
      sel.classList.toggle('selected', !!batas && (t === batas[0] || t === batas[1]));
      sel.classList.toggle('range-start', !!batas && t === batas[0]);
      sel.classList.toggle('range-end', !!batas && t === batas[1]);
      sel.classList.toggle('abs-kal-match', cocok);
      sel.classList.toggle('abs-kal-dim', !!filterKat && !cocok);
    });
    tampilDetail(idx);
  }

  /* ---------- muat data ---------- */
  async function muatBulanPenuh(kunci) {
    var bagian = kunci.split('-'), tahun = Number(bagian[0]), bulanNomor = Number(bagian[1]);
    var dari = kunci + '-01', sampai = kunci + '-' + p2(new Date(tahun, bulanNomor, 0).getDate());
    var token = ++reqId;
    loading.className = 'info loading'; loading.textContent = 'Memuat data absensi…';
    try {
      var res = await api('karyawanAbsensi', { dari: dari, sampai: sampai });
      if (token !== reqId) return;
      data = Array.isArray(res.data) ? res.data : [];
      rentangData = { dari: dari, sampai: sampai };
      cache[kunci] = data; cacheBulanPenuh[kunci] = true;
      info.textContent = infoCakupan;
      loading.classList.add('hidden');
      gambar();
    } catch (e) {
      if (token !== reqId) return;
      loading.className = 'alert'; loading.textContent = pesanError(e) + ' ';
      loading.appendChild(btn('Coba lagi', 'kecil', function () { muatBulanPenuh(kunci); }));
    }
  }
  async function muat() {
    var kunci = ym(bulan), dari = kunci + '-01', sampai = kunci + '-' + p2(new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate());
    var blnDari = dari, blnSampai = sampai;
    var token = ++reqId;
    dipilih = ''; akhirDipilih = '';
    if (cacheBulanPenuh[kunci]) {
      data = cache[kunci];
      rentangData = { dari: blnDari, sampai: blnSampai };
      info.textContent = infoCakupan;
      loading.classList.add('hidden');
      gambar();
      return;
    }
    var awal = muatAwal && kunci === ym(new Date());
    if (awal) {
      var hariIni = new Date();
      var tanggalAwal = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() - 13);
      dari = isoHari(tanggalAwal); sampai = isoHari(hariIni);
      rentangAwal = { dari: dari, sampai: sampai };
    }

    // 1) Auto-verifikasi (idempoten) — hanya menyentuh baris anomali milik sendiri / sesuai hak
    try {
      var av = await api('absensiAutoVerifikasiHadir', { dari: dari, sampai: sampai });
      if (av && av.berhasil > 0) toast(av.berhasil + ' absensi otomatis menjadi Hadir.', 'success');
    } catch (e) { /* opsional */ }
    if (token !== reqId) return;

    // 2) Ambil data
    data = []; rentangData = null; loading.className = 'info loading'; loading.textContent = 'Memuat data absensi…';
    gambar();
    try {
      var res = await api('karyawanAbsensi', { dari: dari, sampai: sampai });
      if (token !== reqId) return;
      data = Array.isArray(res.data) ? res.data : [];
      rentangData = { dari: dari, sampai: sampai };
      if (awal) {
        muatAwal = false;
        info.textContent = infoCakupan;
      } else {
        cache[kunci] = data; cacheBulanPenuh[kunci] = true;
        info.textContent = infoCakupan;
      }
      lintas = !!(res.lihatSemua || res.lihatDivisi);
      if (!lintas) cari.value = '';
      loading.classList.add('hidden');
      muatRoster();
      gambar();
    } catch (e) {
      if (token !== reqId) return;
      loading.className = 'alert'; loading.textContent = pesanError(e) + ' ';
      loading.appendChild(btn('Coba lagi', 'kecil', muat));
    }
  }
  cari.addEventListener('input', function () {
    clearTimeout(cariTimer);
    cariTimer = setTimeout(function () { tampilDetail(idxAktif); }, 120);
  });
  muat();
}
	function absDinasKaryawan(isi) {
	var file = null, previewUrl = null;
	var tanggalEl = el('strong', { text: 'Memuat tanggal…' });
	var jamEl = el('span', { class: 'live-time', text: '--:--' });
	function updateClock() {
		try {
		var now = new Date();
		tanggalEl.textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now);
		jamEl.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(now);
		} catch (e) {}
	}
	updateClock();
	var clockTimer = setInterval(updateClock, 1000);
	var obs = new MutationObserver(function () { if (!document.body.contains(tanggalEl)) { clearInterval(clockTimer); obs.disconnect(); } });
	obs.observe(document.body, { childList: true, subtree: true });
	var dateStrip = el('div', { class: 'dinas-date-strip' }, [
		el('span', { class: 'dinas-calendar', 'aria-hidden': 'true' }),
		el('div', { class: 'dinas-date-text' }, [el('span', { class: 'dinas-date-label', text: 'Hari ini' }), tanggalEl]),
		jamEl
	]);
	function radioPil(nilai, teks, checked) {
		var input = el('input', { type: 'radio', name: 'jenisAbsenDL', value: nilai });
		if (checked) input.checked = true;
		return el('label', { class: 'dinas-opt' }, [input, el('span', { text: teks })]);
	}
	var radioMasuk = radioPil('Masuk', 'Absen Masuk', true);
	var radioKeluar = radioPil('Keluar', 'Absen Keluar', false);
	var jenisWrap = el('fieldset', { class: 'dinas-type' }, [
		el('legend', { class: 'field-label', text: 'Jenis absensi' }),
		el('div', { class: 'dinas-options' }, [radioMasuk, radioKeluar])
	]);
	var lokasi = el('input', { type: 'text', maxlength: '120', autocomplete: 'off', placeholder: 'Contoh : Pengapalan Cpo / Kernel ke dermaga LKS', 'aria-label': 'Lokasi atau tujuan dinas' });
	var prev = el('img', { id: 'dlPhotoPreview', alt: 'Pratinjau foto bukti kehadiran' });
	prev.hidden = true;
	var removeBtn = el('button', { type: 'button', class: 'dinas-remove-photo', 'aria-label': 'Hapus foto', text: '×' });
	var photoBox = el('div', { class: 'dinas-photo-box' });
	photoBox.hidden = true;
	photoBox.appendChild(prev);
	photoBox.appendChild(removeBtn);
	var statusMsg = el('p', { class: 'dinas-status', role: 'status', 'aria-live': 'polite' });
	function setStatus(t, err) { statusMsg.textContent = t || ''; statusMsg.classList.toggle('error', !!err); }
	var cameraInput = el('input', { type: 'file', accept: 'image/*', class: 'hidden', 'aria-label': 'Pilih aplikasi kamera atau sumber foto' });
	function resetInputs() { cameraInput.value = ''; }
	function setFoto(f) {
		if (!f) return;
		if (!fileGambarValid(f)) { setStatus('Pilih file gambar JPG, PNG, WEBP, atau GIF.', true); resetInputs(); return; }
		file = f;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(f);
		prev.src = previewUrl; prev.hidden = false;
		photoBox.hidden = false;
		setStatus('', false);
	}
	function hapusFoto() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null; file = null;
		prev.removeAttribute('src'); prev.hidden = true;
		photoBox.hidden = true;
		resetInputs(); setStatus('', false);
	}
	cameraInput.addEventListener('change', function () { setFoto(cameraInput.files && cameraInput.files[0]); });
	removeBtn.addEventListener('click', hapusFoto);
	function tombolFoto(label, ikoSvg, kelas, onClick) {
		var b = el('button', { type: 'button', class: 'btn ' + kelas, 'aria-label': label, title: label });
		b.innerHTML = ikoSvg;
		b.addEventListener('click', onClick);
		return b;
	}
	var btnKamera = tombolFoto('Pilih aplikasi kamera atau sumber foto', '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-2-3Z"/><circle cx="12" cy="13" r="3"/></svg>', 'primary', function () {
		resetInputs();
		try {
		if (typeof cameraInput.showPicker === 'function') cameraInput.showPicker();
		else cameraInput.click();
		} catch (e) { cameraInput.click(); }
	});
	var kirim = btn('Kirim Absensi', 'primary', async function () {
		if (!file) { setStatus('Tambahkan foto bukti kehadiran terlebih dahulu.', true); return; }
		var jenis = (jenisWrap.querySelector('input[name="jenisAbsenDL"]:checked') || {}).value || 'Masuk';
		if (!lokasi.value.trim()) { setStatus('Isi lokasi atau tujuan dinas.', true); lokasi.focus(); return; }
		kirim.disabled = true; kirim.setAttribute('aria-busy', 'true'); kirim.textContent = 'Mengirim…';
		setStatus('Mengirim absensi…', false);
		try {
		var foto = await kompresFoto(file, new Date().toLocaleString('id-ID'));
		var r = await api('karyawanDinasLuarSimpan', { data: { jenisAbsen: jenis, keterangan: lokasi.value.trim(), fotoBukti: foto } });
		setStatus(r.pesan || 'Absensi dinas luar terkirim.', false);
		toast(r.pesan || 'Absensi dinas luar terkirim.');
		hapusFoto(); lokasi.value = '';
		} catch (e) { setStatus(pesanError(e), true); toast(pesanError(e)); }
		finally { kirim.disabled = false; kirim.removeAttribute('aria-busy'); kirim.textContent = 'Kirim Absensi'; }
	});
	var body = el('div', { class: 'pad dinas-form' }, [
		dateStrip, jenisWrap,
		fieldEl('Lokasi / tujuan dinas', lokasi),
		el('div', { class: 'dinas-photo-head' }, [el('label', { class: 'field-label', text: 'Foto bukti kehadiran' }), el('span', { class: 'dinas-badge', text: 'Wajib' })]),
		el('p', { class: 'sub2', style: 'margin:0 0 10px', text: 'Ambil foto di lokasi atau pilih dari galeri.' }),
		el('div', { class: 'dinas-photo-actions' }, [btnKamera]),
		photoBox,
		cameraInput,
		el('p', { class: 'picker-note dinas-note', text: 'Tekan ikon kamera untuk membuka pilihan kamera atau sumber foto yang tersedia di perangkat. Pilihan yang muncul mengikuti HP dan browser.' }),
		el('div', { class: 'aksi', style: 'padding-left:0;margin-top:16px' }, [kirim]),
		statusMsg
	]);
	isi.appendChild(panelEl('Absen Dinas Luar', null, [body]));
	}

	/**
	 * Form tambah/edit untuk modul yang bisa ditulis karyawan.
	 * row = null ? mode tambah. row = objek ? mode edit.
	 */
	function formModul(menu, row, onSelesai) {
	var mode = row ? 'Edit' : 'Tambah';
	var judul = JUDUL_MODUL[menu] || menu;
	var fields = {};

	var cakupanModul = hakDari(menu).cakupan || 'sendiri';
	var cakupanSemuaModul = cakupanModul === 'semua' || cakupanModul === 'divisi';

	var FIELD_DEF = {
		disiplin: [
		{ key: 'tanggal', label: 'Tanggal', type: 'date' },
		{ key: 'jenis', label: 'Jenis pelanggaran', type: 'text' },
		{ key: 'keterangan', label: 'Keterangan', type: 'textarea' }
		],
		lembur: [
		{ key: 'tanggal', label: 'Tanggal', type: 'date' },
		{ key: 'jam', label: 'Jam lembur', type: 'number' },
		{ key: 'keterangan', label: 'Keterangan', type: 'textarea' }
		],
		absensi: [
		{ key: 'tanggal', label: 'Tanggal', type: 'date' },
		{ key: 'status', label: 'Status kehadiran', type: 'text' },
		{ key: 'jam_masuk', label: 'Jam masuk', type: 'time' },
		{ key: 'jam_keluar', label: 'Jam keluar', type: 'time' },
		{ key: 'keterangan', label: 'Keterangan', type: 'textarea' }
		]
	};

	// Jika user ber-cakupan 'semua', tambahkan field no_absen di awal form
	// supaya bisa menambah/mengedit baris untuk karyawan lain.
	if (cakupanSemuaModul) {
		FIELD_DEF[menu] = [{ key: 'no_absen', label: 'Nomor absen karyawan', type: 'text' }]
		.concat(FIELD_DEF[menu]);
	}

	var defs = FIELD_DEF[menu] || [];
	var elems = [];

	defs.forEach(function (d) {
		var input;
		if (d.type === 'textarea') {
		input = el('textarea', { rows: '3' });
		} else {
		input = el('input', { type: d.type || 'text' });
		}
		if (row && row[d.key] != null) input.value = row[d.key];
		fields[d.key] = input;
		elems.push(fieldEl(d.label, input));
	});

	var err = el('div', { class: 'alert hidden', role: 'alert' });

	bukaModal(mode + ' Data ' + judul, elems.concat([err]), [
		{ teks: 'Batal', klik: function (t) { t(); } },
		{ teks: 'Simpan', kelas: 'primary', klik: async function (t, b) {
		b.disabled = true; b.textContent = 'Menyimpan...';
		try {
			var data = {};
			Object.keys(fields).forEach(function (k) { data[k] = fields[k].value; });
			var param = { menu: menu, data: data };
			if (row && row._row) param.row = row._row;
			var res = await api('karyawanModulSimpan', param);
			toast(res.pesan || 'Tersimpan.');
			t();
			if (onSelesai) onSelesai();
		} catch (e) {
			err.textContent = pesanError(e);
			err.classList.remove('hidden');
		} finally {
			b.disabled = false; b.textContent = 'Simpan';
		}
		} }
	]).box.classList.add('lebar');
	}

	function renderGantiPassword() {
	var wajib = S.karyawan && S.karyawan.wajibGantiPassword;
	var isi = halaman(wajib ? 'Ganti Password Wajib' : 'Ganti Password', 'Perbarui password untuk menjaga keamanan akun portal Anda.');
	var lama = el('input', { type: 'password', autocomplete: 'current-password', placeholder: wajib ? 'Masukkan password sementara' : 'Masukkan password saat ini' });
	var baru = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Minimal 8 karakter' });
	var ulang = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Masukkan kembali password baru' });
	var b = btn('Simpan password', 'primary', async function () {
		if (baru.value.length < 8) { toast('Password baru minimal 8 karakter.'); baru.focus(); return; }
		if (baru.value !== ulang.value) { toast('Konfirmasi password tidak sama.'); ulang.focus(); return; }
		b.disabled = true; b.textContent = 'Menyimpan?';
		try {
		var r = await api('karyawanGantiPassword', { passwordLama: lama.value, passwordBaru: baru.value });
		if (S.karyawan) S.karyawan.wajibGantiPassword = false;
		toast(r.pesan || 'Password berhasil diubah.');
		pilih('profil');
		} catch (e) { toast(pesanError(e)); }
		finally { b.disabled = false; b.textContent = 'Simpan password'; }
	});
	isi.appendChild(panelEl('Keamanan akun', null, [el('div', { class: 'pad' }, [
		el('p', { class: 'sub2', text: 'Gunakan password pribadi yang tidak dibagikan kepada siapa pun.' }),
		el('div', { style: 'display:grid;gap:14px;max-width:520px;margin-top:12px' }, [
		fieldEl('Password saat ini', lama, wajib ? 'Password sementara dari HRD.' : 'Verifikasi password yang sedang digunakan.'),
		fieldEl('Password baru', baru, 'Minimal 8 karakter, sulit ditebak.'),
		fieldEl('Konfirmasi password baru', ulang, 'Harus sama persis.')
		]),
		el('div', { class: 'aksi', style: 'padding-left:0' }, [b])
	])]));
	}

	var skalaTeks = 1;
	var ukuranAsliTeks = new WeakMap();
	function perbaruiUkuranTeks(root) {
	var daftar = [];
	if (root && root.nodeType === 1) daftar.push(root);
	if (root && root.querySelectorAll) daftar = daftar.concat(Array.prototype.slice.call(root.querySelectorAll('*')));
	daftar.forEach(function (node) {
		if (node.closest && node.closest('.font-size-controls')) return;
		var adaTeks = Array.prototype.some.call(node.childNodes || [], function (c) {
		return c.nodeType === 3 && c.nodeValue.trim();
		});
		if (!adaTeks && !/^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName || '')) return;
		var asli = ukuranAsliTeks.get(node);
		if (asli == null && skalaTeks === 1) return;
		if (asli == null) {
		asli = parseFloat(getComputedStyle(node).fontSize);
		ukuranAsliTeks.set(node, asli);
		}
		node.style.fontSize = (asli * skalaTeks) + 'px';
	});
	$('fontDecrease').disabled = skalaTeks <= 0.8;
	$('fontIncrease').disabled = skalaTeks >= 1.3;
	}
	function ubahUkuranTeks(delta) {
	skalaTeks = Math.max(0.8, Math.min(1.3, Math.round((skalaTeks + delta) * 10) / 10));
	perbaruiUkuranTeks(document.body);
	}
	var PALET_TEMA = {
	cream: { bg:'#FFF4D6', paper:'#FFFBEE', side:'#FFD93D', hd:'#FFD93D', ac:'#FF8FB1', ac2:'#7BD3EA', mut:'#3d3d3d' },
	sage: { bg:'#EEF3E5', paper:'#FAFCF5', side:'#C9D9B8', hd:'#C9D9B8', ac:'#9DBB91', ac2:'#D8E8D0', mut:'#465044' },
	lavender: { bg:'#F0EAFE', paper:'#FCFAFF', side:'#D7C9F3', hd:'#D7C9F3', ac:'#B6A4E8', ac2:'#E3DAFA', mut:'#514967' },
	ocean: { bg:'#E4F4FA', paper:'#F8FDFF', side:'#9BD8E8', hd:'#9BD8E8', ac:'#77C8DF', ac2:'#BCEAF4', mut:'#36525D' },
	peach: { bg:'#FFF0E5', paper:'#FFFAF5', side:'#F6C7A9', hd:'#F6C7A9', ac:'#F2B38F', ac2:'#F9D9C4', mut:'#5B463B' },
	mono: { bg:'#F0F0F0', paper:'#FFFFFF', side:'#D0D0D0', hd:'#D0D0D0', ac:'#BDBDBD', ac2:'#E2E2E2', mut:'#454545' }
	};
	var ROOT_STYLE = document.documentElement.style;
	function terapkanPalet(nama, latarCustom) {
	var p = PALET_TEMA[nama] || PALET_TEMA.cream;
	if (document.documentElement.getAttribute('data-theme') !== 'dark') {
		['bg','paper','side','hd','ac','ac2','mut'].forEach(function(k){ ROOT_STYLE.setProperty('--'+k, p[k]); });
		if (latarCustom) ROOT_STYLE.setProperty('--bg', latarCustom);
	}
	try { localStorage.setItem('hrd_palett', nama); if (latarCustom) localStorage.setItem('hrd_latar_custom', latarCustom); else localStorage.removeItem('hrd_latar_custom'); } catch(e) {}
	document.querySelectorAll('.appearance-swatches [data-palette]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-palette') === nama)); });
	if ($('customBackground')) $('customBackground').value = latarCustom || p.bg;
	if ($('appearanceStatus')) $('appearanceStatus').textContent = 'Tema diterapkan';
	}
	var appearanceTimer = null;
	function tutupAppearance(){
	clearTimeout(appearanceTimer);
	if ($('appearancePanel')) $('appearancePanel').classList.add('hidden');
	}
	function jadwalkanTutupAppearance(){
	clearTimeout(appearanceTimer);
	if (!$('appearancePanel') || $('appearancePanel').classList.contains('hidden')) return;
	appearanceTimer = setTimeout(tutupAppearance, 5000);
	}
	var paletteImage = $('fontPanelToggle').querySelector('img');
	if (paletteImage) paletteImage.addEventListener('error', function () {
	this.replaceWith(ikon('<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="14" cy="7" r=".8"/><circle cx="17" cy="10" r=".8"/>'));
	});
	$('fontPanelToggle').addEventListener('click', function(){
	var panel = $('appearancePanel');
	if (!panel) return;
	panel.classList.toggle('hidden');
	jadwalkanTutupAppearance();
	});
	['pointermove', 'pointerdown', 'keydown', 'focusin'].forEach(function(eventName){
	$('appearancePanel').addEventListener(eventName, jadwalkanTutupAppearance);
	});
	$('appearanceClose').addEventListener('click', tutupAppearance);
	document.querySelectorAll('.appearance-swatches [data-palette]').forEach(function(b){ b.setAttribute('aria-pressed','false'); b.addEventListener('click',function(){ terapkanPalet(this.getAttribute('data-palette'), ''); }); });
	$('customBackground').addEventListener('input',function(){
	var nama = 'cream'; try { nama = localStorage.getItem('hrd_palett') || 'cream'; } catch(e) {}
	terapkanPalet(nama, this.value);
	});
	$('resetAppearance').addEventListener('click',function(){ terapkanPalet('cream',''); if ($('appearanceStatus')) $('appearanceStatus').textContent='Tampilan direset'; });
	document.addEventListener('click',function(e){
	if ($('appearancePanel').classList.contains('hidden')) return;
	if ($('appearancePanel').contains(e.target) || $('fontSizeControls').contains(e.target)) return;
	tutupAppearance();
	});
	try {
	var paletTersimpan = localStorage.getItem('hrd_palett') || 'cream';
	var latarTersimpan = localStorage.getItem('hrd_latar_custom') || '';
	if (document.documentElement.getAttribute('data-theme') !== 'dark') terapkanPalet(paletTersimpan, latarTersimpan);
	if ($('appearanceStatus')) $('appearanceStatus').textContent='';
	} catch(e) { if (document.documentElement.getAttribute('data-theme') !== 'dark') terapkanPalet('cream',''); }

	var tombolTema = $('themeToggle');
	if (tombolTema) tombolTema.addEventListener('click', function(){
	setTimeout(function(){
		if (document.documentElement.getAttribute('data-theme') !== 'dark') {
		var n='cream', bg=''; try { n=localStorage.getItem('hrd_palett')||'cream'; bg=localStorage.getItem('hrd_latar_custom')||''; } catch(e) {}
		terapkanPalet(n,bg);
		}
	},0);
	});

	var fontControls = $('fontSizeControls');
	var fontPanelTimer = null;
	function tutupKontrolUkuranTeks() {
	clearTimeout(fontPanelTimer);
	fontControls.classList.remove('is-open');
	$('fontPanelToggle').setAttribute('aria-expanded', 'false');
	$('fontPanelToggle').setAttribute('aria-label', 'Buka pengaturan tampilan');
	$('fontPanelToggle').title = 'Buka pengaturan tampilan';
	}
	function jadwalkanTutupKontrolUkuranTeks() {
	clearTimeout(fontPanelTimer);
	if (!fontControls.classList.contains('is-open')) return;
	fontPanelTimer = setTimeout(tutupKontrolUkuranTeks, 5000);
	}
	$('fontPanelToggle').addEventListener('click', function () {
	if (fontControls.classList.contains('is-open')) {
		tutupKontrolUkuranTeks();
		return;
	}
	fontControls.classList.add('is-open');
	this.setAttribute('aria-expanded', 'true');
	this.setAttribute('aria-label', 'Tutup pengaturan tampilan');
	this.title = 'Tutup pengaturan tampilan';
	jadwalkanTutupKontrolUkuranTeks();
	});
	$('fontDecrease').addEventListener('click', function () {
	ubahUkuranTeks(-0.1);
	jadwalkanTutupKontrolUkuranTeks();
	});
	$('fontIncrease').addEventListener('click', function () {
	ubahUkuranTeks(0.1);
	jadwalkanTutupKontrolUkuranTeks();
	});
	['pointermove', 'pointerdown', 'keydown', 'focusin'].forEach(function (eventName) {
	fontControls.addEventListener(eventName, jadwalkanTutupKontrolUkuranTeks);
	});
	document.addEventListener('click', function (e) {
	if (!fontControls.contains(e.target)) tutupKontrolUkuranTeks();
	});
	document.addEventListener('keydown', function (e) {
	if (e.key === 'Escape') tutupKontrolUkuranTeks();
	});
	perbaruiUkuranTeks(document.body);
	var amatiTeksBaru = new MutationObserver(function (mutasi) {
	mutasi.forEach(function (m) {
		Array.prototype.forEach.call(m.addedNodes, function (node) {
		if (node.nodeType === 1) perbaruiUkuranTeks(node);
		});
	});
	});
	amatiTeksBaru.observe(document.body, { childList: true, subtree: true });

	initBersama();
	toggleLihat('employeePassword', 'lihatEmployee');

	// Enter memindahkan fokus ke kolom berikutnya, lalu menjalankan aksi di akhir.
	document.addEventListener('keydown', function (e) {
	if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
	var target = e.target;
	if (!target || target.tagName !== 'INPUT' || !/^(text|password|search|date|time|number|email|tel|url)$/i.test(target.type)) return;
	var scope = target.closest('.modal, .dinas-form, .panel, .card, #isi') || document;
	var fields = Array.prototype.filter.call(scope.querySelectorAll('input, select, textarea'), function (field) {
		if (field.disabled || field.type === 'hidden' || field.type === 'file' || field.type === 'checkbox' || field.type === 'radio') return false;
		return !!(field.offsetWidth || field.offsetHeight || field.getClientRects().length);
	});
	var current = fields.indexOf(target);
	if (current < 0) return;
	e.preventDefault();
	if (current < fields.length - 1) {
		fields[current + 1].focus();
		return;
	}
	var actions = Array.prototype.filter.call(scope.querySelectorAll('button:not(:disabled)'), function (button) {
		if (!(button.offsetWidth || button.offsetHeight || button.getClientRects().length)) return false;
		if (button.classList.contains('tema-toggle') || button.id === 'menuToggle' || button.id === 'profilToggle') return false;
		var label = String(button.textContent || '').trim();
		return button.id === 'masuk' || /^(terapkan(?: filter)?|simpan(?: password)?|kirim(?: absensi)?|ajukan|masuk(?: ke portal)?)$/i.test(label);
	});
	var action = actions.find(function (button) {
		return !!(target.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING);
	});
	if (action) action.click();
	});
	pulihkanSesi();
	})();

	/* RAJA PALMA SPLASH SCREEN */
	(function () {
	const splash = document.getElementById('rpSplashScreen');
	if (!splash) return;

	const key = 'rp_splash_visited';
	let sudahDilihat = false;

	try {
		sudahDilihat = sessionStorage.getItem(key) === '1';
		if (!sudahDilihat) sessionStorage.setItem(key, '1');
	} catch (e) {
		// Splash tetap harus ditutup meskipun penyimpanan sesi diblokir browser.
	}

	if (sudahDilihat) {
		splash.remove();
		return;
	}

	window.setTimeout(() => {
		splash.classList.add('rp-hidden');
		window.setTimeout(() => {
		if (splash.isConnected) splash.remove();
		}, 550);
	}, 2500);
	})();
