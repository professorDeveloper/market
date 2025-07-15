// Lottie is now available globally via the script tag in marketplace.html
const lottie = window.lottie

class PortalsMarketplaceApp {
    constructor() {
        this.mainApp = document.getElementById("main-app")
        this.mainContentArea = document.getElementById("main-content-area")
        this.lottieAnimations = []
        this.nftGridItems = [] // To store NFT cards for scroll effects
        this.lottieUrls = {
            skullflower: "https://nft.fragment.com/gift/skullflower-12626.lottie.json",
            plushpepe: "https://nft.fragment.com/gift/plushpepe-1626.lottie.json",
            durovscap: "https://nft.fragment.com/gift/durovscap-1727.lottie.json",
            lollipop: "https://nft.fragment.com/gift/lollipop-12345.lottie.json",
            calendar: "https://nft.fragment.com/gift/calendar-67890.lottie.json",
            sakura: "https://nft.fragment.com/gift/sakura-11223.lottie.json",
            cake: "https://nft.fragment.com/gift/cake-98765.lottie.json",
            // New Lottie for user icon (using skullflower as a placeholder)
            userIconLottie: "https://nft.fragment.com/gift/skullflower-12626.lottie.json", // Placeholder for custom user icon
        }

        // Swipe to refresh properties
        this.ptrElement = document.getElementById("pull-to-refresh-indicator")
        this.startY = 0
        this.currentY = 0
        this.pullThreshold = 80 // Pixels to pull down to trigger refresh
        this.isRefreshing = false

        this.init()
    }

    async init() {
        await this.loadHeaderLottieAnimations() // Load Lottie for the user icon
        await this.loadNftGridLotties() // Load Lotties for NFT grid items
        this.addGlobalEventListeners()
        this.addMarketplaceContentEventListeners()
        this.setupScrollEffects()
        this.setupSwipeToRefresh()
    }

    async loadHeaderLottieAnimations() {
        const promises = []

        // Load Lottie for the user icon in the header
        const userLottieContainer = document.getElementById("user-lottie-icon")
        if (userLottieContainer) {
            promises.push(this.loadSingleLottie(userLottieContainer, this.lottieUrls.userIconLottie))
        }

        try {
            await Promise.all(promises)
        } catch (error) {
            console.warn("Some header Lottie animations failed to load:", error)
        }
    }

    async loadNftGridLotties() {
        const promises = []
        const nftImagePlaceholders = document.querySelectorAll(".nft-grid .nft-image-placeholder")

        nftImagePlaceholders.forEach((placeholder) => {
            const lottieKey = placeholder.dataset.lottieKey
            const lottieUrl = this.lottieUrls[lottieKey]
            const lottieContainer = placeholder.querySelector(".lottie-nft-container")

            if (lottieContainer && lottieUrl) {
                promises.push(this.loadSingleLottie(lottieContainer, lottieUrl))
            } else {
                console.warn(`Could not load Lottie for key "${lottieKey}": container or URL missing.`)
            }
        })

        try {
            await Promise.all(promises)
        } catch (error) {
            console.warn("Some NFT grid Lottie animations failed to load:", error)
        }
    }

    async loadSingleLottie(container, url) {
        return new Promise((resolve, reject) => {
            try {
                const animation = lottie.loadAnimation({
                    container: container,
                    renderer: "svg",
                    loop: true,
                    autoplay: true,
                    path: url,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid meet",
                        clearCanvas: false,
                        progressiveLoad: true,
                        hideOnTransparent: true,
                    },
                })

                animation.addEventListener("DOMLoaded", () => {
                    this.lottieAnimations.push(animation)
                    resolve(animation)
                })

                animation.addEventListener("error", () => {
                    reject(new Error(`Failed to load: ${url}`))
                })

                setTimeout(() => {
                    if (animation.isLoaded) {
                        resolve(animation)
                    } else {
                        reject(new Error(`Timeout loading: ${url}`))
                    }
                }, 5000)
            } catch (error) {
                reject(error)
            }
        })
    }

    // --- Event Listeners ---
    addGlobalEventListeners() {
        // Bottom navigation
        const navButtons = document.querySelectorAll(".bottom-nav .nav-button")
        navButtons.forEach((button) => {
            button.addEventListener("click", () => {
                navButtons.forEach((btn) => btn.classList.remove("active"))
                button.classList.add("active")
                console.log(`Navigated to: ${button.dataset.page}`)
            })
        })

        // Handle resize with debouncing
        let resizeTimeout
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(() => {
                // Recalculate positions if needed
            }, 250)
        })

        // Prevent context menu on long press (mobile)
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault()
        })

        // Handle visibility change for performance
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.lottieAnimations.forEach((animation) => {
                    animation.pause()
                })
            } else {
                this.lottieAnimations.forEach((animation) => {
                    animation.play()
                })
            }
        })
    }

    addMarketplaceContentEventListeners() {
        // Example: Cart progress update (can be tied to actual cart logic)
        const cartProgressBar = document.querySelector(".cart-progress-fill")
        const cartCount = document.querySelector(".cart-count")
        if (cartProgressBar && cartCount) {
            // Simulate cart update
            let currentCartItems = 0
            const maxCartItems = 10 // Example max
            setInterval(() => {
                currentCartItems = (currentCartItems + 1) % (maxCartItems + 1)
                cartProgressBar.style.width = `${(currentCartItems / maxCartItems) * 100}%`
                cartCount.textContent = currentCartItems.toString()
            }, 2000)
        }
    }

    // --- Scroll Motion Coordinator Effect ---
    setupScrollEffects() {
        this.nftGridItems = Array.from(document.querySelectorAll(".nft-grid .nft-item-card"))

        let ticking = false
        this.mainApp.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.applyScrollEffects()
                        ticking = false
                    })
                    ticking = true
                }
            },
            { passive: true },
        )

        // Apply effects on initial load
        this.applyScrollEffects()
    }

    applyScrollEffects() {
        const viewportHeight = this.mainApp.clientHeight
        const scrollTop = this.mainApp.scrollTop

        this.nftGridItems.forEach((item) => {
            const itemRect = item.getBoundingClientRect()
            const itemTop = itemRect.top + scrollTop // Absolute position from top of scrollable area

            // Calculate visibility percentage
            const itemCenter = itemTop + itemRect.height / 2
            const viewportCenter = scrollTop + viewportHeight / 2
            const distanceToCenter = Math.abs(itemCenter - viewportCenter)

            // Normalize distance (0 when centered, 1 when at edge)
            const maxDistance = viewportHeight / 2 + itemRect.height / 2
            const normalizedDistance = Math.min(distanceToCenter / maxDistance, 1)

            // Apply effects: scale and opacity
            const scale = 1 - normalizedDistance * 0.05 // Slightly less scale down
            const opacity = 1 - normalizedDistance * 0.2 // Slightly less fade out

            item.style.transform = `scale(${scale})`
            item.style.opacity = opacity.toString()
            item.style.transition = "transform 0.1s linear, opacity 0.1s linear" // Smooth transition
        })
    }

    // --- Swipe to Refresh ---
    setupSwipeToRefresh() {
        if (!this.ptrElement) return

        this.mainApp.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true })
        this.mainApp.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false }) // Passive false to allow preventDefault
        this.mainApp.addEventListener("touchend", this.handleTouchEnd.bind(this))
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY
        this.mainApp.style.transition = "" // Remove transition for immediate response
        this.ptrElement.style.transition = ""
        this.ptrElement.style.opacity = "0"
        this.ptrElement.style.transform = "translateY(-100%)"
    }

    handleTouchMove(e) {
        this.currentY = e.touches[0].clientY
        const diff = this.currentY - this.startY

        if (this.mainApp.scrollTop === 0 && diff > 0 && !this.isRefreshing) {
            e.preventDefault() // Prevent scrolling when pulling down from top
            const pullDistance = Math.min(diff / 2, this.pullThreshold * 1.5) // Apply damping
            this.ptrElement.style.transform = `translateY(${pullDistance - this.ptrElement.offsetHeight}px)`
            this.ptrElement.style.opacity = `${pullDistance / this.pullThreshold}`

            if (pullDistance >= this.pullThreshold) {
                this.ptrElement.classList.add("release")
            } else {
                this.ptrElement.classList.remove("release")
            }
        }
    }

    handleTouchEnd() {
        const diff = this.currentY - this.startY
        this.mainApp.style.transition = "transform 0.3s ease-out"
        this.ptrElement.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out"

        if (this.mainApp.scrollTop === 0 && diff / 2 >= this.pullThreshold && !this.isRefreshing) {
            this.isRefreshing = true
            this.ptrElement.style.transform = "translateY(0)" // Show indicator fully
            this.ptrElement.style.opacity = "1"
            this.ptrElement.classList.add("refreshing")
            this.ptrElement.querySelector("svg").classList.add("spin")

            this.performRefresh()
        } else {
            this.ptrElement.style.transform = "translateY(-100%)"
            this.ptrElement.style.opacity = "0"
            this.ptrElement.classList.remove("release")
        }

        this.startY = 0
        this.currentY = 0
    }

    performRefresh() {
        console.log("Performing refresh...")
        // Simulate data refresh
        setTimeout(() => {
            console.log("Refresh complete!")
            this.ptrElement.style.transform = "translateY(-100%)"
            this.ptrElement.style.opacity = "0"
            this.ptrElement.classList.remove("refreshing")
            this.ptrElement.querySelector("svg").classList.remove("spin")
            this.isRefreshing = false
            // Re-initialize Lotties or re-fetch data here if needed
            // For this example, we'll just log and reset.
        }, 1500)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new PortalsMarketplaceApp()
})
