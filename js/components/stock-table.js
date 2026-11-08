// ===== KOMPONEN <ba-stock-table>: HALAMAN STOK BAHAN AJAR =====
// Menampilkan daftar stok beserta filter, sort, status, dan aksi tambah/edit/hapus. Data stok
// datang dari root lewat prop items. Komponen ini tidak mengubah items secara langsung; setiap
// perubahan dikirim ke root lewat event create, update, dan delete.

Vue.component("ba-stock-table", {
    template: "#tpl-stock",

    props: {
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
        return {
            // State filter dan sort tabel stok.
            filters: {
                upbjj: "",
                kategori: "",
                reorderOnly: false
            },
            sort: {
                key: "judul",
                direction: "asc"
            },
            sortOptions: [
                { value: "judul", label: "Judul" },
                { value: "qty", label: "Jumlah stok" },
                { value: "harga", label: "Harga" }
            ],

            // formMode "" berarti modal form tertutup; "create" atau "edit" menentukan isi modal.
            formMode: "",
            editingItem: null,
            deletingItem: null,

            // Pesan hasil aksi terakhir (tambah, edit, atau hapus).
            feedback: ""
        };
    },

    computed: {
        // Computed di-cache oleh Vue: daftar hanya dihitung ulang ketika data stok atau filter yang
        // dipakai benar-benar berubah, bukan setiap kali komponen dirender ulang.
        filteredStok: function () {
            var filters = this.filters;

            return this.items.filter(function (item) {
                var cocokUpbjj = filters.upbjj === "" || item.upbjj === filters.upbjj;
                var cocokKategori = filters.kategori === "" || item.kategori === filters.kategori;
                var cocokReorder = !filters.reorderOnly || item.qty < item.safety;

                return cocokUpbjj && cocokKategori && cocokReorder;
            });
        },

        sortedStok: function () {
            var key = this.sort.key;
            var arah = this.sort.direction === "asc" ? 1 : -1;

            // slice() agar urutan array stok asli tidak ikut berubah saat diurutkan.
            return this.filteredStok.slice().sort(function (first, second) {
                if (key === "judul") {
                    return first.judul.localeCompare(second.judul, "id") * arah;
                }

                return (first[key] - second[key]) * arah;
            });
        },

        // Dependent options: kategori hanya menawarkan pilihan yang benar-benar ada di UT-Daerah terpilih.
        kategoriOptions: function () {
            var upbjj = this.filters.upbjj;
            var items = this.items;

            return this.kategoriList.filter(function (kategori) {
                return items.some(function (item) {
                    return item.upbjj === upbjj && item.kategori === kategori;
                });
            });
        },

        // Stok menipis (qty < safety) sudah mencakup stok kosong, karena safety minimal 1.
        reorderCount: function () {
            return this.items.filter(function (item) {
                return item.qty < item.safety;
            }).length;
        },

        isFilterActive: function () {
            return this.filters.upbjj !== "" || this.filters.kategori !== "" || this.filters.reorderOnly;
        },

        // Tombol reset hanya aktif bila ada yang bisa dikembalikan: filter terpasang atau
        // urutan tidak lagi default (judul, naik).
        canReset: function () {
            var isSortDefault = this.sort.key === "judul" && this.sort.direction === "asc";

            return this.isFilterActive || !isSortDefault;
        },

        sortDirectionLabel: function () {
            return this.sort.direction === "asc" ? "Urutan naik" : "Urutan turun";
        },

        formTitle: function () {
            return this.formMode === "edit" ? "Edit bahan ajar" : "Tambah bahan ajar";
        }
    },

    watch: {
        // Saat UT-Daerah berganti, kategori lama belum tentu tersedia di daerah baru, jadi filter
        // kategori dikosongkan agar tabel tidak tiba-tiba tampil kosong.
        "filters.upbjj": function () {
            this.filters.kategori = "";
        }
    },

    methods: {
        // Kode yang sama bisa ada di beberapa UT-Daerah, jadi kunci baris memakai keduanya.
        rowKey: function (item) {
            return item.kode + "|" + item.upbjj;
        },

        resetFilter: function () {
            this.filters.upbjj = "";
            this.filters.kategori = "";
            this.filters.reorderOnly = false;
            this.sort.key = "judul";
            this.sort.direction = "asc";
        },

        toggleSortDirection: function () {
            this.sort.direction = this.sort.direction === "asc" ? "desc" : "asc";
        },

        bukaFormTambah: function () {
            this.editingItem = null;
            this.formMode = "create";
        },

        bukaFormEdit: function (item) {
            this.editingItem = item;
            this.formMode = "edit";
        },

        tutupForm: function () {
            this.formMode = "";
            this.editingItem = null;
        },

        simpanForm: function (dataBaru) {
            if (this.formMode === "edit") {
                this.$emit("update", this.editingItem, dataBaru);
                this.feedback = "Data " + dataBaru.kode + " (" + dataBaru.upbjj + ") berhasil diperbarui.";
            } else {
                this.$emit("create", dataBaru);
                this.feedback = "Bahan ajar " + dataBaru.kode + " (" + dataBaru.upbjj + ") berhasil ditambahkan.";
            }

            this.tutupForm();
        },

        tanyaHapus: function (item) {
            this.deletingItem = item;
        },

        batalHapus: function () {
            this.deletingItem = null;
        },

        konfirmasiHapus: function () {
            var item = this.deletingItem;

            this.$emit("delete", item);
            this.feedback = "Bahan ajar " + item.kode + " (" + item.upbjj + ") berhasil dihapus.";
            this.deletingItem = null;
        }
    }
});
