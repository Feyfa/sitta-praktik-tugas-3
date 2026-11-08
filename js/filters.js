// ===== FILTER: FORMAT TEKS UNTUK TAMPILAN =====
// Filter global Vue 2 dipanggil dengan tanda pipa, misalnya {{ item.harga | rupiah }}.
// Filter hanya mengubah teks yang tampil; nilai asli di data tetap berupa angka atau string tanggal.

var NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// 65000 -> "Rp 65.000"
Vue.filter("rupiah", function (value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
});

// 28 -> "28 buah"
Vue.filter("satuan", function (value) {
    return value + " buah";
});

// "2025-08-25" -> "25 Agustus 2025". String dipecah manual, bukan lewat new Date("2025-08-25"),
// karena format itu dibaca sebagai UTC sehingga tanggal bisa bergeser.
Vue.filter("tanggal", function (value) {
    var bagian = String(value || "").split("-");

    if (bagian.length !== 3) {
        return value;
    }

    var hari = parseInt(bagian[2], 10);
    var bulan = NAMA_BULAN[parseInt(bagian[1], 10) - 1];

    return hari + " " + bulan + " " + bagian[0];
});

// "2025-08-25 10:12:20" -> "25 Agustus 2025, 10.12"
Vue.filter("waktu", function (value) {
    var bagian = String(value || "").split(" ");
    var tanggal = Vue.filter("tanggal")(bagian[0]);
    var jam = (bagian[1] || "").slice(0, 5).replace(":", ".");

    return jam ? tanggal + ", " + jam : tanggal;
});
