// ===== KOMPONEN <ba-stock-form>: FORM TAMBAH DAN EDIT BAHAN AJAR =====
// Satu form dipakai untuk dua mode: "create" (bahan ajar baru) dan "edit" (perbarui data).
// Form bekerja pada salinan data sehingga tombol Batal tidak mengubah tabel. Hasil yang valid
// dikirim ke pemakai lewat event "submit"; form tidak mengubah data stok secara langsung.

// Kode MK UT terdiri dari 3-5 huruf lalu 4 angka (EKMA4116, FISIP4001), sedangkan lokasi rak
// mengikuti pola data contoh seperti R1-A3.
var POLA_KODE_MK = /^[A-Z]{3,5}\d{4}$/;
var POLA_LOKASI_RAK = /^R\d+-[A-Z]\d+$/;

Vue.component("ba-stock-form", {
    template: "#tpl-stock-form",

    props: {
        mode: {
            type: String,
            default: "create"
        },
        item: {
            type: Object,
            default: null
        },
        items: {
            type: Array,
            required: true
        },
        upbjjList: {
            type: Array,
            required: true
        },
        kategoriList: {
            type: Array,
            required: true
        }
    },

    data: function () {
        var item = this.item;
        var catatanAwal = item ? Helpers.teksDariHtml(item.catatanHTML) : "";

        return {
            form: {
                kode: item ? item.kode : "",
                judul: item ? item.judul : "",
                kategori: item ? item.kategori : "",
                upbjj: item ? item.upbjj : "",
                lokasiRak: item ? item.lokasiRak : "",
                harga: item ? item.harga : "",
                qty: item ? item.qty : "",
                safety: item ? item.safety : "",
                catatan: catatanAwal
            },

            // Disimpan untuk mengetahui apakah catatan diubah saat mode edit.
            catatanAwal: catatanAwal,
            submitAttempted: false,
            kodeInfo: ""
        };
    },

    computed: {
        isEdit: function () {
            return this.mode === "edit";
        },

        formErrors: function () {
            var form = this.form;
            var errors = {};

            // --- langkah 1 - mulai - validasi identitas bahan ajar
            if (form.kode === "") {
                errors.kode = "Kode mata kuliah wajib diisi.";
            } else if (!POLA_KODE_MK.test(form.kode)) {
                errors.kode = "Format kode: 3-5 huruf diikuti 4 angka, contoh EKMA4116.";
            } else if (!this.isEdit && this.isDuplicate(form.kode, form.upbjj)) {
                errors.kode = "Kode ini sudah terdaftar di UT-Daerah " + form.upbjj + ".";
            }

            if (form.judul.trim().length < 3) {
                errors.judul = "Nama mata kuliah minimal 3 karakter.";
            }

            if (form.kategori === "") {
                errors.kategori = "Pilih kategori mata kuliah.";
            }

            if (form.upbjj === "") {
                errors.upbjj = "Pilih UT-Daerah.";
            }

            if (!POLA_LOKASI_RAK.test(String(form.lokasiRak).trim().toUpperCase())) {
                errors.lokasiRak = "Format lokasi rak: R1-A3.";
            }
            // --- langkah 1 - selesai - validasi identitas bahan ajar

            // --- langkah 2 - mulai - validasi angka harga dan stok
            if (!Number.isInteger(form.harga) || form.harga <= 0) {
                errors.harga = "Harga harus bilangan bulat lebih dari 0.";
            }

            if (!Number.isInteger(form.qty) || form.qty < 0) {
                errors.qty = "Jumlah stok harus bilangan bulat 0 atau lebih.";
            }

            if (!Number.isInteger(form.safety) || form.safety < 1) {
                errors.safety = "Safety stock harus bilangan bulat minimal 1.";
            }
            // --- langkah 2 - selesai - validasi angka harga dan stok

            return errors;
        },

        isFormValid: function () {
            return Object.keys(this.formErrors).length === 0;
        }
    },

    watch: {
        // Rapikan kode yang diketik (huruf besar, tanpa spasi) dan beri informasi bila kode itu
        // sudah dipakai di UT-Daerah lain, sehingga judulnya bisa disamakan.
        "form.kode": function (kodeBaru) {
            var kodeRapi = kodeBaru.toUpperCase().replace(/\s+/g, "");

            if (kodeRapi !== kodeBaru) {
                this.form.kode = kodeRapi;
                return;
            }

            if (this.isEdit) {
                return;
            }

            var existing = this.items.find(function (item) {
                return item.kode === kodeRapi;
            });

            this.kodeInfo = existing
                ? "Kode ini sudah ada: " + existing.judul + " (" + existing.upbjj + ")."
                : "";
        }
    },

    methods: {
        isDuplicate: function (kode, upbjj) {
            return this.items.some(function (item) {
                return item.kode === kode && item.upbjj === upbjj;
            });
        },

        // Enter pada kolom isian langsung menyimpan form. Enter pada tombol dibiarkan menjalankan
        // tombol itu sendiri, misalnya tombol Batal.
        simpanDenganEnter: function (event) {
            if (event.target.tagName === "BUTTON") {
                return;
            }

            event.preventDefault();
            this.simpan();
        },

        simpan: function () {
            this.submitAttempted = true;

            if (!this.isFormValid) {
                return;
            }

            // --- langkah 1 - mulai - tentukan catatan yang disimpan
            var form = this.form;
            var catatan = form.catatan.trim();
            var catatanHTML;

            if (this.isEdit && catatan === this.catatanAwal) {
                // Catatan tidak diubah: format HTML aslinya (miring, tebal) dipertahankan.
                catatanHTML = this.item.catatanHTML;
            } else {
                catatanHTML = catatan === "" ? "" : Helpers.escapeHtml(catatan);
            }
            // --- langkah 1 - selesai - tentukan catatan yang disimpan

            // --- langkah 2 - mulai - kirim data bahan ajar ke pemakai komponen
            this.$emit("submit", {
                kode: form.kode,
                judul: form.judul.trim(),
                kategori: form.kategori,
                upbjj: form.upbjj,
                lokasiRak: form.lokasiRak.trim().toUpperCase(),
                harga: form.harga,
                qty: form.qty,
                safety: form.safety,
                catatanHTML: catatanHTML
            });
            // --- langkah 2 - selesai - kirim data bahan ajar ke pemakai komponen
        }
    }
});
