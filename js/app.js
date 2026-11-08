// ===== ROOT VUE: MEMUAT DATA, NAVIGASI TAB, DAN PENGELOLAAN STATE =====
// Root menyimpan satu-satunya salinan data aplikasi (state) dan membagikannya ke komponen lewat
// props. Komponen melapor lewat event ($emit), lalu method di sini yang mengubah state, sehingga
// semua halaman selalu membaca data yang sama. Perubahan hanya tersimpan di memori: memuat ulang
// halaman mengembalikan data awal dari dataBahanAjar.json.

var app = new Vue({
    el: "#app",

    data: {
        // Routing sederhana: tab yang aktif menentukan section yang tampil ('stok' | 'tracking' | 'order').
        tab: "stok",
        loading: true,
        loadError: "",
        notice: "",
        noticeTimer: null,

        state: {
            upbjjList: [],
            kategoriList: [],
            pengirimanList: [],
            paket: [],
            stok: [],
            tracking: {}
        }
    },

    computed: {
        // Ditampilkan sebagai angka kecil di menu Stok agar stok yang perlu re-order terlihat dari mana saja.
        reorderCount: function () {
            return this.state.stok.filter(function (item) {
                return item.qty < item.safety;
            }).length;
        }
    },

    // Data dan template dimuat bersamaan. Selama proses ini root hanya menampilkan pesan memuat,
    // sehingga komponen baru dirender setelah template-nya tersedia di dokumen.
    created: function () {
        var vm = this;

        Promise.all([Api.loadData(), Api.loadTemplates()])
            .then(function (hasil) {
                vm.state = hasil[0];
            })
            .catch(function (error) {
                vm.loadError = error.message;
            })
            .finally(function () {
                vm.loading = false;
            });
    },

    methods: {
        // ----- Stok bahan ajar -----
        tambahStok: function (item) {
            this.state.stok.push(item);
        },

        // splice() dipakai agar Vue mendeteksi penggantian elemen array.
        ubahStok: function (itemLama, itemBaru) {
            var index = this.state.stok.indexOf(itemLama);

            if (index !== -1) {
                this.state.stok.splice(index, 1, itemBaru);
            }
        },

        hapusStok: function (item) {
            var index = this.state.stok.indexOf(item);

            if (index !== -1) {
                this.state.stok.splice(index, 1);
            }
        },

        // ----- Delivery Order -----
        handleNewDO: function (nomor, doBaru) {
            // Vue 2 tidak mendeteksi key baru yang ditambahkan langsung ke object
            // (tracking[nomor] = ...), jadi $set dipakai agar daftar DO dan nomor berikutnya ikut diperbarui.
            this.$set(this.state.tracking, nomor, doBaru);

            this.tab = "tracking";
            this.$refs.tracking.lihatDO(nomor);
            this.tampilkanNotice("DO " + nomor + " berhasil dibuat. Detailnya tampil di halaman Tracking DO.");
        },

        tambahProgres: function (nomor, perjalananBaru, status) {
            var order = this.state.tracking[nomor];

            order.perjalanan.push(perjalananBaru);
            order.status = status;
        },

        // Pesan singkat di pojok layar yang hilang sendiri setelah beberapa detik.
        tampilkanNotice: function (pesan) {
            var vm = this;

            clearTimeout(this.noticeTimer);
            this.notice = pesan;

            this.noticeTimer = setTimeout(function () {
                vm.notice = "";
            }, 4000);
        }
    }
});
