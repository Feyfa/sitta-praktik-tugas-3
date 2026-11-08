// ===== KOMPONEN <order-form>: FORM PEMESANAN / DELIVERY ORDER BARU =====
// Membuat DO baru dengan nomor otomatis, pilihan ekspedisi dan paket, tanggal kirim, serta total
// harga dari paket. DO yang valid dikirim ke root lewat event "created"; root yang menyimpannya.

var POLA_NIM = /^\d{9}$/;
var POLA_NAMA = /^[A-Za-z][A-Za-z .']*$/;

function createEmptyDO() {
    return {
        nim: "",
        nama: "",
        ekspedisi: "",
        paketKode: "",
        tanggalKirim: Helpers.tanggalLokal(new Date()),
        total: 0
    };
}

Vue.component("order-form", {
    template: "#tpl-order",

    props: {
        tracking: {
            type: Object,
            required: true
        },
        paket: {
            type: Array,
            required: true
        },
        ekspedisi: {
            type: Array,
            required: true
        },
        stok: {
            type: Array,
            required: true
        }
    },

    data: function () {
        return {
            form: createEmptyDO(),
            submitAttempted: false
        };
    },

    computed: {
        // Nomor DO = "DO" + tahun berjalan + urutan 3 digit. Urutan dihitung dari DO tahun yang
        // sama saja, sehingga data contoh DO2025-0001 tidak memengaruhi nomor tahun berjalan.
        nextNomorDO: function () {
            var prefix = "DO" + new Date().getFullYear() + "-";

            var urutanTerakhir = Object.keys(this.tracking)
                .filter(function (nomor) {
                    return nomor.indexOf(prefix) === 0;
                })
                .map(function (nomor) {
                    return parseInt(nomor.slice(prefix.length), 10) || 0;
                })
                .reduce(function (terbesar, urutan) {
                    return Math.max(terbesar, urutan);
                }, 0);

            return prefix + Helpers.padAngka(urutanTerakhir + 1, 3);
        },

        selectedPaket: function () {
            var kode = this.form.paketKode;

            return this.paket.find(function (item) {
                return item.kode === kode;
            }) || null;
        },

        selectedEkspedisi: function () {
            var kode = this.form.ekspedisi;

            return this.ekspedisi.find(function (item) {
                return item.kode === kode;
            }) || null;
        },

        formErrors: function () {
            var form = this.form;
            var errors = {};

            if (!POLA_NIM.test(form.nim)) {
                errors.nim = "NIM wajib 9 digit angka.";
            }

            if (form.nama.trim().length < 3) {
                errors.nama = "Nama minimal 3 huruf.";
            } else if (!POLA_NAMA.test(form.nama.trim())) {
                errors.nama = "Nama hanya boleh berisi huruf, spasi, titik, atau apostrof.";
            }

            if (form.ekspedisi === "") {
                errors.ekspedisi = "Pilih jenis ekspedisi.";
            }

            if (form.paketKode === "") {
                errors.paketKode = "Pilih paket bahan ajar.";
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tanggalKirim)) {
                errors.tanggalKirim = "Tanggal kirim wajib diisi.";
            }

            return errors;
        },

        isFormValid: function () {
            return Object.keys(this.formErrors).length === 0;
        }
    },

    watch: {
        // Total harga selalu mengikuti harga paket yang dipilih.
        "form.paketKode": function () {
            this.form.total = this.selectedPaket ? this.selectedPaket.harga : 0;
        }
    },

    methods: {
        // Enter pada kolom isian langsung menyimpan DO. Enter pada tombol dibiarkan menjalankan
        // tombol itu sendiri, misalnya tombol Kosongkan form.
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

            // --- langkah 1 - mulai - susun data DO baru dari form
            var form = this.form;
            var nomor = this.nextNomorDO;

            var doBaru = {
                nim: form.nim,
                nama: form.nama.trim(),
                status: "Diproses",
                ekspedisi: "JNE " + this.selectedEkspedisi.nama,
                tanggalKirim: form.tanggalKirim,
                paket: form.paketKode,
                total: form.total,
                perjalanan: [
                    {
                        waktu: Helpers.waktuLokal(new Date()),
                        keterangan: "Data DO dibuat, menunggu penjemputan oleh ekspedisi"
                    }
                ]
            };
            // --- langkah 1 - selesai - susun data DO baru dari form

            // --- langkah 2 - mulai - kirim DO ke root lalu kosongkan form
            this.$emit("created", nomor, doBaru);
            this.resetForm();
            // --- langkah 2 - selesai - kirim DO ke root lalu kosongkan form
        },

        resetForm: function () {
            this.form = createEmptyDO();
            this.submitAttempted = false;
        },

        judulBahanAjar: function (kode) {
            var item = this.stok.find(function (bahanAjar) {
                return bahanAjar.kode === kode;
            });

            return item ? item.judul : "Judul belum tercatat";
        }
    }
});
