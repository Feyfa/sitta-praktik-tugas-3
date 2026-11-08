// ===== KOMPONEN <do-tracking>: HALAMAN TRACKING DELIVERY ORDER =====
// Mencari DO berdasarkan nomor DO atau NIM, menampilkan detail dan riwayat perjalanan, serta
// menambah progres perjalanan baru. Data DO datang dari root lewat prop tracking; progres baru
// dikirim ke root lewat event "add-progress".

// Progres pengiriman per status. "Diproses" dipakai untuk DO yang baru dibuat dari form pemesanan.
var PROGRES_STATUS = {
    "Diproses": 20,
    "Dalam Perjalanan": 60,
    "Dikirim": 100
};

Vue.component("do-tracking", {
    template: "#tpl-tracking",

    props: {
        tracking: {
            type: Object,
            required: true
        },
        paket: {
            type: Array,
            required: true
        }
    },

    data: function () {
        return {
            // State pencarian DO.
            searchMode: "nomor",
            keyword: "",
            searchError: "",
            results: [],
            activeNumber: "",

            // State form tambah progres perjalanan.
            statusList: Object.keys(PROGRES_STATUS),
            progressForm: {
                keterangan: "",
                status: ""
            },
            progressAttempted: false
        };
    },

    computed: {
        jumlahDO: function () {
            return Object.keys(this.tracking).length;
        },

        activeOrder: function () {
            return this.tracking[this.activeNumber] || null;
        },

        progress: function () {
            if (!this.activeOrder) {
                return 0;
            }

            return PROGRES_STATUS[this.activeOrder.status] || 0;
        },

        progressLabel: function () {
            if (this.progress === 100) {
                return "Paket sudah selesai dikirim";
            }

            if (this.progress >= 60) {
                return "Paket sedang dalam perjalanan";
            }

            return "Paket sedang disiapkan untuk dikirim";
        },

        // slice() agar urutan riwayat asli tidak berubah ketika diurutkan untuk tampilan.
        sortedEvents: function () {
            if (!this.activeOrder) {
                return [];
            }

            return this.activeOrder.perjalanan.slice().sort(function (first, second) {
                return first.waktu.localeCompare(second.waktu);
            });
        },

        progressError: function () {
            if (this.progressForm.keterangan.trim().length < 3) {
                return "Keterangan progres minimal 3 karakter.";
            }

            return "";
        }
    },

    watch: {
        // Pesan "tidak ditemukan" dihapus begitu pengguna mengetik ulang kata kunci.
        keyword: function () {
            this.searchError = "";
        },

        // Kata kunci lama tidak berlaku lagi saat mode pencarian berganti (nomor DO <-> NIM).
        searchMode: function () {
            this.keyword = "";
            this.searchError = "";
        },

        // Form progres disiapkan ulang setiap kali DO yang ditampilkan berganti, dengan status awal
        // mengikuti status DO tersebut.
        activeNumber: function () {
            this.progressForm.keterangan = "";
            this.progressForm.status = this.activeOrder ? this.activeOrder.status : "";
            this.progressAttempted = false;
        }
    },

    methods: {
        cari: function () {
            // --- langkah 1 - mulai - rapikan kata kunci dan kosongkan hasil sebelumnya
            var kataKunci = this.keyword.trim().toUpperCase();
            var tracking = this.tracking;
            var hasil;

            this.searchError = "";
            this.results = [];
            this.activeNumber = "";

            if (kataKunci === "") {
                this.searchError = this.searchMode === "nomor"
                    ? "Masukkan nomor DO terlebih dahulu."
                    : "Masukkan NIM terlebih dahulu.";
                return;
            }
            // --- langkah 1 - selesai - rapikan kata kunci dan kosongkan hasil sebelumnya

            // --- langkah 2 - mulai - cari DO sesuai mode pencarian
            // Nomor DO bersifat unik sehingga hasilnya paling banyak satu, sedangkan satu NIM bisa
            // memiliki beberapa DO.
            if (this.searchMode === "nomor") {
                hasil = tracking[kataKunci] ? [kataKunci] : [];
            } else {
                hasil = Object.keys(tracking).filter(function (nomor) {
                    return tracking[nomor].nim === kataKunci;
                });
            }
            // --- langkah 2 - selesai - cari DO sesuai mode pencarian

            // --- langkah 3 - mulai - tampilkan hasil atau pesan kesalahan
            if (hasil.length === 0) {
                this.searchError = this.searchMode === "nomor"
                    ? "Nomor DO " + kataKunci + " tidak ditemukan. Periksa kembali nomor yang dimasukkan."
                    : "Tidak ada DO untuk NIM " + kataKunci + ".";
                return;
            }

            this.results = hasil;
            this.lihatDO(hasil[0]);
            // --- langkah 3 - selesai - tampilkan hasil atau pesan kesalahan
        },

        resetPencarian: function () {
            this.keyword = "";
            this.searchError = "";
            this.results = [];
            this.activeNumber = "";
        },

        // Dipanggil dari hasil pencarian, daftar DO, dan dari root setelah DO baru dibuat.
        lihatDO: function (nomor) {
            this.activeNumber = nomor;

            // Kartu hasil berada di atas daftar DO, jadi halaman digulir ke sana setelah Vue
            // selesai merender kartu tersebut.
            this.$nextTick(function () {
                if (this.$refs.hasil) {
                    this.$refs.hasil.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        },

        tambahProgres: function () {
            this.progressAttempted = true;

            if (this.progressError) {
                return;
            }

            // Waktu diambil dari jam perangkat (local time) saat tombol ditekan.
            var perjalananBaru = {
                waktu: Helpers.waktuLokal(new Date()),
                keterangan: this.progressForm.keterangan.trim()
            };

            this.$emit("add-progress", this.activeNumber, perjalananBaru, this.progressForm.status);

            this.progressForm.keterangan = "";
            this.progressAttempted = false;
        },

        namaPaket: function (kode) {
            var item = this.paket.find(function (paket) {
                return paket.kode === kode;
            });

            return item ? item.nama : "-";
        },

        statusClass: function (status) {
            return {
                "is-done": status === "Dikirim",
                "is-new": status === "Diproses"
            };
        }
    }
});
