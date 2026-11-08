// ===== HELPER UMUM: TANGGAL LOKAL, NOMOR URUT, DAN TEKS HTML =====
// Fungsi kecil yang dipakai lebih dari satu komponen dikumpulkan di sini agar tidak ditulis ulang.

var Helpers = (function () {
    function padAngka(angka, panjang) {
        var teks = String(angka);

        while (teks.length < panjang) {
            teks = "0" + teks;
        }

        return teks;
    }

    // Tanggal dan waktu disusun dari komponen lokal, bukan toISOString(), karena toISOString()
    // memakai UTC sehingga tanggal bisa mundur sehari ketika dibuka sebelum pukul 07.00 WIB.
    function tanggalLokal(date) {
        return date.getFullYear() + "-" + padAngka(date.getMonth() + 1, 2) + "-" + padAngka(date.getDate(), 2);
    }

    function waktuLokal(date) {
        return tanggalLokal(date) + " "
            + padAngka(date.getHours(), 2) + ":"
            + padAngka(date.getMinutes(), 2) + ":"
            + padAngka(date.getSeconds(), 2);
    }

    // Ketikan pengguna di-escape sebelum disimpan sebagai catatanHTML, karena catatan ditampilkan
    // dengan v-html; tanpa ini teks seperti <script> akan diperlakukan sebagai HTML.
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Mengambil teks polos dari catatanHTML untuk diisikan ke form edit. DOMParser dipakai karena
    // dokumen hasil parse tidak aktif: script dan atribut seperti onerror tidak dijalankan.
    function teksDariHtml(html) {
        var dokumen = new DOMParser().parseFromString(html || "", "text/html");

        return dokumen.body.textContent.trim();
    }

    return {
        padAngka: padAngka,
        tanggalLokal: tanggalLokal,
        waktuLokal: waktuLokal,
        escapeHtml: escapeHtml,
        teksDariHtml: teksDariHtml
    };
})();
