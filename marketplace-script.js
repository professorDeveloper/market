// Lottie is now available globally via the script tag in marketplace.html
const lottie = window.lottie

class PortalsMarketplaceApp {
    constructor() {
        this.mainApp = document.getElementById("main-app")
        this.mainContentArea = document.getElementById("main-content-area")
        this.mainHeader = document.getElementById("main-header") // Get the header element
        this.filtersSearchArea = document.getElementById("filters-search-area") // Get the filters/search area
        this.nftGrid = document.getElementById("nft-grid") // Get the NFT grid container
        this.layoutToggleButton = document.getElementById("layout-toggle-button") // Get the layout toggle button
        this.searchInput = document.getElementById("search-input") // Get the search input
        this.lottieAnimations = []
        this.nftGridItems = [] // To store NFT cards for scroll effects
        this.isGridView = true // Initial layout state
        this.lottieUrls = {
            skullflower: "https://nft.fragment.com/gift/skullflower-12626.lottie.json",
            plushpepe: "https://nft.fragment.com/gift/plushpepe-1626.lottie.json",
            durovscap: "https://nft.fragment.com/gift/durovscap-1727.lottie.json",
            lollipop: "https://nft.fragment.com/gift/heartlocket-876.lottie.json", // Updated URL
            calendar: "https://nft.fragment.com/gift/deskcalendar-67890.lottie.json", // Updated URL
            sakura: "https://nft.fragment.com/gift/sakuraflower-11223.lottie.json", // Updated URL
            cake: "https://nft.fragment.com/gift/skullflower-8765.lottie.json", // Updated URL
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
        this.updateLayoutButtonIcon() // Set initial icon for layout button
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

        // Custom Dropdown Logic
        document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
            const header = dropdown.querySelector(".dropdown-header")
            const content = dropdown.querySelector(".dropdown-content")

            header.addEventListener("click", () => {
                // Close other open dropdowns
                document.querySelectorAll(".custom-dropdown .dropdown-content.open").forEach((openContent) => {
                    if (openContent !== content) {
                        openContent.classList.remove("open")
                        openContent.previousElementSibling.querySelector("svg").style.transform = "rotate(0deg)"
                    }
                })

                const isOpen = content.classList.toggle("open")
                header.querySelector("svg").style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)"
            })

            content.querySelectorAll(".dropdown-item").forEach((item) => {
                item.addEventListener("click", () => {
                    header.querySelector("span").textContent = item.textContent
                    content.classList.remove("open")
                    header.querySelector("svg").style.transform = "rotate(0deg)"
                    // You can add actual filter logic here based on item.dataset.value
                    console.log(`Selected: ${item.dataset.value}`)
                })
            })

            // Close dropdown if clicked outside
            document.addEventListener("click", (event) => {
                if (!dropdown.contains(event.target)) {
                    content.classList.remove("open")
                    header.querySelector("svg").style.transform = "rotate(0deg)"
                }
            })
        })

        // Layout Toggle Button Listener
        if (this.layoutToggleButton) {
            this.layoutToggleButton.addEventListener("click", this.toggleLayout.bind(this))
        }

        // Search Input Listener
        if (this.searchInput) {
            this.searchInput.addEventListener("input", (e) => {
                console.log("Search query:", e.target.value)
                // Implement actual search filtering logic here
            })
        }
    }

    addMarketplaceContentEventListeners() {
        // No longer simulating cart progress as the seekbar is removed.
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
                        this.applyHeaderAndFilterScrollEffect() // Apply effect to header and filter area
                        ticking = false
                    })
                    ticking = true
                }
            },
            { passive: true },
        )

        // Apply effects on initial load
        this.applyScrollEffects()
        this.applyHeaderAndFilterScrollEffect()
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

    applyHeaderAndFilterScrollEffect() {
        if (!this.mainHeader || !this.filtersSearchArea) return

        const scrollTop = this.mainApp.scrollTop
        const headerHeight = this.mainHeader.offsetHeight
        const filtersSearchAreaHeight = this.filtersSearchArea.offsetHeight

        // Header scroll effect: hides as you scroll down
        const headerScrollProgress = Math.min(scrollTop / headerHeight, 1)
        this.mainHeader.style.transform = `translateY(-${headerScrollProgress * headerHeight}px)`
        this.mainHeader.style.opacity = `${1 - headerScrollProgress * 0.5}` // Fade out slightly

        // Filters search area sticky effect: stays at top once header is hidden
        // It should hide with the header, then stick to the top.
        // Calculate how much of the filters/search area should be hidden
        const combinedHeight = headerHeight + filtersSearchAreaHeight
        const scrollProgressCombined = Math.min(scrollTop / combinedHeight, 1)

        // The filtersSearchArea should move up with the header, but only until it reaches the top.
        // Once the header is fully hidden, the filtersSearchArea should stick.
        // The `top` property is already handled by CSS `position: sticky`.
        // We need to adjust its `transform` based on scroll.
        if (scrollTop > headerHeight) {
            this.filtersSearchArea.style.transform = `translateY(-${scrollTop - headerHeight}px)`
            this.filtersSearchArea.style.opacity = "1" // Keep full opacity when sticky
        } else {
            this.filtersSearchArea.style.transform = `translateY(0px)`
            this.filtersSearchArea.style.opacity = `${1 - headerScrollProgress * 0.5}` // Fade out with header
        }
    }

    // --- Layout Toggle ---
    toggleLayout() {
        this.isGridView = !this.isGridView
        if (this.isGridView) {
            this.nftGrid.classList.remove("list-view")
        } else {
            this.nftGrid.classList.add("list-view")
        }
        this.updateLayoutButtonIcon()
        // Re-apply scroll effects to ensure correct positioning/scaling for new layout
        this.applyScrollEffects()
    }

    updateLayoutButtonIcon() {
        if (this.layoutToggleButton) {
            const iconSvg = this.isGridView
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid-3x3"><path d="M10 2v20"/><path d="M14 2v20"/><path d="M2 14h20"/><path d="M2 10h20"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`
            this.layoutToggleButton.innerHTML = iconSvg
        }
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
        this.ptrElement.style.transform = "translateY(-100%)" // Ensure it's hidden initially
    }

    handleTouchMove(e) {
        this.currentY = e.touches[0].clientY
        const diff = this.currentY - this.startY

        // Only activate if at the very top of the scroll and pulling down
        if (this.mainApp.scrollTop === 0 && diff > 0 && !this.isRefreshing) {
            e.preventDefault() // Prevent scrolling when pulling down from top
            const pullDistance = Math.min(diff / 2, this.pullThreshold * 1.5) // Apply damping

            // Adjust transform to bring it into view from above
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
            this.ptrElement.style.transform = "translateY(-100%)" // Hide it again
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
