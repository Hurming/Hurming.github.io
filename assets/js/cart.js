// Additional cart functionality
document.addEventListener('alpine:init', () => {
    // Cart store is defined in base layout

    // Flash Sale Countdown Timer
    Alpine.data('flashSaleCountdown', (initialSeconds) => ({
        totalSeconds: initialSeconds,
        hours: 0,
        minutes: 0,
        seconds: 0,
        interval: null,

        startCountdown() {
            this.updateDisplay();
            this.interval = setInterval(() => {
                if (this.totalSeconds > 0) {
                    this.totalSeconds--;
                    this.updateDisplay();
                } else {
                    clearInterval(this.interval);
                    // Reload page when sale ends
                    window.location.reload();
                }
            }, 1000);
        },

        updateDisplay() {
            this.hours = Math.floor(this.totalSeconds / 3600);
            this.minutes = Math.floor((this.totalSeconds % 3600) / 60);
            this.seconds = this.totalSeconds % 60;
        }
    }));

    // Package Upgrade Store - handles upgrade offers for logged-in players
    Alpine.store('upgrades', {
        offers: [],
        loading: false,
        showModal: false,
        currentOffer: null,
        dismissedOffers: JSON.parse(localStorage.getItem('dismissedUpgrades') || '[]'),

        async fetchOffers() {
            if (this.loading) return;
            this.loading = true;
            try {
                const response = await fetch('/api/auth/upgrade-offers', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    this.offers = data.offers || [];
                }
            } catch (e) {
                console.error('Failed to fetch upgrade offers:', e);
            }
            this.loading = false;
        },

        getOfferForPackage(packageId) {
            return this.offers.find(o => o.existing_package.id === packageId);
        },

        showUpgradeModal(offer) {
            if (this.dismissedOffers.includes(offer.existing_package.id)) return false;
            this.currentOffer = offer;
            this.showModal = true;
            return true;
        },

        dismissOffer(packageId) {
            this.dismissedOffers.push(packageId);
            localStorage.setItem('dismissedUpgrades', JSON.stringify(this.dismissedOffers));
            this.showModal = false;
            this.currentOffer = null;
        },

        closeModal() {
            this.showModal = false;
            this.currentOffer = null;
        },

        formatPrice(amount) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: window.mcsets?.currency || 'USD' }).format(amount);
        }
    });
});