// Lottie is now available globally via the script tag in index.html
const lottie = window.lottie

class PortalsSplashScreen {
    constructor() {
        this.progressFill = document.getElementById("progress-fill")
        this.progressPercentage = document.getElementById("progress-percentage")
        this.splashScreen = document.getElementById("splash-screen")
        // this.mainApp is no longer needed here as we are redirecting
        this.lottieAnimations = []
        this.lottieUrls = {
            skullflower: "https://nft.fragment.com/gift/skullflower-12626.lottie.json",
            plushpepe: "https://nft.fragment.com/gift/plushpepe-1626.lottie.json",
            durovscap: "https://nft.fragment.com/gift/durovscap-1727.lottie.json",
            lollipop: "https://nft.fragment.com/gift/durovscap-2424.lottie.json",
            calendar: "https://nft.fragment.com/gift/starnotepad-8506.lottie.json",
            deathnote: "https://nft.fragment.com/gift/deskcalendar-67890.lottie.json", // Corrected typo
            cake: "https://nft.fragment.com/gift/deskcalendar-98765.lottie.json",
            sakura: "https://nft.fragment.com/gift/deskcalendar-11223.lottie.json",
        }

        this.lottieLoadPromise = null // To store the promise for Lottie loading
        this.progressAnimationPromise = null // To store the promise for progress animation

        this.init()
    }

    async init() {
        // Start Lottie loading and progress animation in parallel
        this.lottieLoadPromise = this.loadAllLottieAnimations()
        this.progressAnimationPromise = new Promise((resolve) => {
            this.startProgress(resolve) // Pass resolve to indicate completion
        })

        // Wait for both to complete before navigating
        try {
            await Promise.all([this.lottieLoadPromise, this.progressAnimationPromise])
            console.log("All assets loaded and splash screen animation complete. Navigating to marketplace.")
            this.navigateToMarketplace()
        } catch (error) {
            console.error("Error during splash screen loading:", error)
            // Even if there's an error, we might want to proceed after a delay
            setTimeout(() => this.navigateToMarketplace(), 2000) // Fallback
        }
        this.addGlobalEventListeners() // Global listeners can be added earlier
    }

    async loadAllLottieAnimations() {
        const promises = []

        // Load main "magic" Lottie (using lollipop for a more abstract/magic feel)
        const mainMagicContainer = document.getElementById("main-magic-lottie")
        if (mainMagicContainer) {
            promises.push(this.loadSingleLottie(mainMagicContainer, this.lottieUrls.lollipop))
        }

        // Load multiple smaller Lotties (cycling through available ones)
        const smallLottieContainers = [
            { id: "small-lottie-1", url: this.lottieUrls.skullflower },
            { id: "small-lottie-2", url: this.lottieUrls.plushpepe },
            { id: "small-lottie-3", url: this.lottieUrls.durovscap },
            { id: "small-lottie-4", url: this.lottieUrls.calendar },
            { id: "small-lottie-5", url: this.lottieUrls.sakura },
            // Ensure small-lottie-6 exists in HTML if you want to load it
            // { id: "small-lottie-6", url: this.lottieUrls.deathnote },
        ]

        smallLottieContainers.forEach((item) => {
            const container = document.getElementById(item.id)
            if (container) {
                promises.push(this.loadSingleLottie(container, item.url))
            }
        })

        return Promise.all(promises) // Return the promise for all Lotties
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

                // Fallback timeout in case DOMLoaded doesn't fire
                setTimeout(() => {
                    if (animation.isLoaded) {
                        resolve(animation)
                    } else {
                        reject(new Error(`Timeout loading: ${url}`))
                    }
                }, 10000)
            } catch (error) {
                reject(error)
            }
        })
    }

    startProgress(resolve) {
        // Accept resolve callback
        let progress = 0
        const duration = 2000 // 2 seconds
        const startTime = performance.now()

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime
            progress = Math.min((elapsed / duration) * 100, 100)

            const easedProgress = this.easeOutCubic(progress / 100) * 100

            if (this.progressFill) {
                this.progressFill.style.width = `${easedProgress}%`
            }
            if (this.progressPercentage) {
                this.progressPercentage.textContent = `${Math.floor(easedProgress)}%`
            }

            if (progress < 100) {
                requestAnimationFrame(animate)
            } else {
                resolve() // Resolve the promise when animation is complete
            }
        }

        requestAnimationFrame(animate)
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3)
    }

    navigateToMarketplace() {
        // Redirect to marketplace.html
        window.location.href = "marketplace.html"
    }

    addGlobalEventListeners() {
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault()
        })

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
}

document.addEventListener("DOMContentLoaded", () => {
    new PortalsSplashScreen()
})
