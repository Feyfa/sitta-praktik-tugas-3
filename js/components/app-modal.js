// ===== KOMPONEN <app-modal>: JENDELA POP UP SERBAGUNA =====
// Kerangka pop up (latar gelap, judul, tombol tutup). Isinya diisi oleh komponen pemakai
// lewat <slot>, misalnya form bahan ajar atau konfirmasi hapus. Modal tidak menutup dirinya
// sendiri; ia hanya mengirim event "close" dan pemakai yang mengubah prop show.

Vue.component("app-modal", {
    template: "#tpl-modal",

    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        }
    },

    watch: {
        // Listener Esc hanya aktif selama modal terbuka, supaya tombol Esc di bagian lain halaman
        // (misalnya reset pencarian DO) tidak ikut terpengaruh.
        show: function (terbuka) {
            if (terbuka) {
                document.addEventListener("keydown", this.tutupDenganEsc);
                this.$nextTick(this.fokusKeIsian);
            } else {
                document.removeEventListener("keydown", this.tutupDenganEsc);
            }
        }
    },

    beforeDestroy: function () {
        document.removeEventListener("keydown", this.tutupDenganEsc);
    },

    methods: {
        close: function () {
            this.$emit("close");
        },

        tutupDenganEsc: function (event) {
            if (event.key === "Escape") {
                this.close();
            }
        },

        // Kursor langsung diletakkan di isian pertama agar pengguna bisa mengetik lalu menekan
        // Enter tanpa klik. Elemen bertanda data-autofocus didahulukan bila ada.
        fokusKeIsian: function () {
            var dialog = this.$refs.dialog;

            if (!dialog) {
                return;
            }

            var target = dialog.querySelector("[data-autofocus]")
                || dialog.querySelector("input:not([readonly]):not([disabled]), select:not([disabled])");

            if (target) {
                target.focus();
            }
        }
    }
});
