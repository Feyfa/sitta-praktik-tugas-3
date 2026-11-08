// ===== KOMPONEN <status-badge>: STATUS STOK DAN TOOLTIP CATATAN =====
// Menampilkan status Aman/Menipis/Kosong dari qty dan safety. Catatan (catatanHTML) muncul
// sebagai tooltip ketika kursor diarahkan ke status, atau ketika status difokus lewat keyboard.

Vue.component("status-badge", {
    template: "#tpl-badge",

    props: {
        qty: {
            type: Number,
            required: true
        },
        safety: {
            type: Number,
            required: true
        },
        catatan: {
            type: String,
            default: ""
        }
    },

    data: function () {
        return {
            showTooltip: false
        };
    },

    computed: {
        // Kosong dicek lebih dulu karena qty 0 juga memenuhi syarat qty < safety.
        status: function () {
            if (this.qty === 0) {
                return "kosong";
            }

            if (this.qty < this.safety) {
                return "menipis";
            }

            return "aman";
        }
    }
});
