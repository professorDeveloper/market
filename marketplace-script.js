// Lottie is now available globally via the script tag in index.html
const lottie = window.lottie

class PortalsMarketplaceApp {
    constructor() {
        this.mainApp = document.getElementById("main-app")
        this.mainHeader = document.getElementById("main-header")
        this.filtersSearchArea = document.getElementById("filters-search-area")
        this.nftGrid = document.getElementById("nft-grid")
        this.layoutToggleButton = document.getElementById("layout-toggle-button")
        this.searchInput = document.getElementById("search-input")
        this.userLottieIcon = document.getElementById("user-lottie-icon")
        this.pullToRefreshIndicator = document.getElementById("pull-to-refresh-indicator")
        this.loadingIndicator = document.getElementById("loading-indicator")
        this.endOfListMessage = document.getElementById("end-of-list-message")
        this.backButton = document.getElementById("back-button") // Added back button element

        this.lottieAnimations = new Map() // Store Lottie instances by container element
        this.isGridView = true // Initial layout state
        this.lottieUrls = {
            skullflower: "https://nft.fragment.com/gift/skullflower-12626.lottie.json",
            plushpepe: "https://nft.fragment.com/gift/plushpepe-1626.lottie.json",
            durovscap: "https://nft.fragment.com/gift/durovscap-1727.lottie.json",
            lollipop: "https://nft.fragment.com/gift/heartlocket-876.lottie.json",
            calendar: "https://nft.fragment.com/gift/deskcalendar-67890.lottie.json",
            sakura: "https://nft.fragment.com/gift/sakuraflower-11223.lottie.json",
            cake: "https://nft.fragment.com/gift/skullflower-8765.lottie.json",
            userIconLottie: "https://nft.fragment.com/gift/skullflower-12626.lottie.json", // Placeholder for custom user icon
        }

        // Get an array of just the Lottie URLs for random selection, excluding the user icon
        const availableLottieUrls = Object.values(this.lottieUrls).filter((url) => url !== this.lottieUrls.userIconLottie)

        // Mock NFT data - increased to 100 items for better demonstration of infinite scroll
        this.mockNfts = [
            {id: "#1000", name: "Generic NFT 1", price: 0.89, lottieUrl: this.lottieUrls.skullflower},
            {id: "#1001", name: "Generic NFT 2", price: 0.72, lottieUrl: this.lottieUrls.lollipop},
            {id: "#1002", name: "Generic NFT 3", price: 1.16, lottieUrl: this.lottieUrls.calendar},
            {id: "#1003", name: "Generic NFT 4", price: 2.2, lottieUrl: this.lottieUrls.sakura},
            {id: "#1004", name: "Generic NFT 5", price: 4.75, lottieUrl: this.lottieUrls.plushpepe},
            {id: "#1005", name: "Generic NFT 6", price: 5.03, lottieUrl: this.lottieUrls.skullflower},
            {id: "#1727", name: "Durov's cap", price: 200200, lottieUrl: this.lottieUrls.durovscap},
            {id: "#1006", name: "Generic NFT 7", price: 1.5, lottieUrl: this.lottieUrls.sakura},
            {id: "#1007", name: "Generic NFT 8", price: 3.2, lottieUrl: this.lottieUrls.plushpepe},
            // Add more custom NFTs here if desired
        ].concat(
            Array.from({length: 90}).map((_, i) => {
                const randomLottieUrl = availableLottieUrls[Math.floor(Math.random() * availableLottieUrls.length)]
                return {
                    id: `#${(1000 + i + 8).toString().padStart(4, "0")}`,
                    name: `Generic NFT ${i + 9}`,
                    price: Number.parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
                    lottieUrl: randomLottieUrl, // Directly use the URL
                }
            }),
        )

        this.nftsLoadedCount = 0
        this.nftsPerLoad = 24// Initial load count
        this.isLoadingNfts = false
        this.hasMoreNfts = true

        // Pull to refresh properties
        this.startY = 0
        this.currentY = 0
        this.pullThreshold = 80 // Pixels to pull down to trigger refresh
        this.isRefreshing = false
        this.lastScrollTop = 0 // For header/filter hide/show

        this.init()
    }

    init() {
        this.loadSingleLottie(this.userLottieIcon, this.lottieUrls.userIconLottie, true)
        this.addGlobalEventListeners()
        this.setupPullToRefresh()
        this.updateLayoutButtonIcon()
        this.loadMoreNfts() // Initial load of NFTs
        this.setupInfiniteScroll()
    }

    /**
     * Loads a single Lottie animation into a container.
     * @param {HTMLElement} container - The DOM element to render the Lottie animation into.
     * @param {string} url - The URL of the Lottie JSON file.
     * @param {boolean} autoplay - Whether the animation should autoplay.
     * @param {boolean} loop - Whether the animation should loop.
     * @returns {object} The Lottie animation instance.
     */
    loadSingleLottie(container, url, autoplay = true, loop = true) {
        if (!container || !url) {
            console.warn("Lottie container or URL missing.", {container, url})
            return null
        }
        const animation = lottie.loadAnimation({
            container: container,
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: url,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid meet",
                clearCanvas: false,
                progressiveLoad: true,

                hideOnTransparent: true,
            },
        })
        this.lottieAnimations.set(container, animation)
        return animation
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

        // Back Button Listener
        if (this.backButton) {
            this.backButton.addEventListener("click", () => {
                window.history.back()
            })
        }

        // Scroll event for header/filter hide/show
        this.mainApp.addEventListener("scroll", this.handleScrollEffects.bind(this), {passive: true})
    }

    handleScrollEffects() {
        const currentScrollTop = this.mainApp.scrollTop
        const headerHeight = this.mainHeader.offsetHeight
        const filtersHeight = this.filtersSearchArea.offsetHeight

        // Determine scroll direction
        const scrollDirection = currentScrollTop > this.lastScrollTop ? "down" : "up"

        // Header and Filters visibility based on scroll direction and position
        if (scrollDirection === "down" && currentScrollTop > headerHeight / 2) {
            // Scrolling down
            this.mainHeader.style.transform = `translateY(-${headerHeight}px)`
            this.mainHeader.style.opacity = "0"
            this.filtersSearchArea.style.transform = `translateY(-${filtersHeight}px)`
            this.filtersSearchArea.style.opacity = "0"
        } else if (scrollDirection === "up" || currentScrollTop <= headerHeight / 2) {
            // Scrolling up or at top
            this.mainHeader.style.transform = `translateY(0)`
            this.mainHeader.style.opacity = "1"
            this.filtersSearchArea.style.transform = `translateY(0)`
            this.filtersSearchArea.style.opacity = "1"
        }

        this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop
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
    }

    updateLayoutButtonIcon() {
        if (this.layoutToggleButton) {
            const iconSvg = this.isGridView
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid-3x3"><path d="M10 2v20"/><path d="M14 2v20"/><path d="M2 14h20"/><path d="M2 10h20"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`
            this.layoutToggleButton.innerHTML = iconSvg
        }
    }

    // --- NFT Loading and Lottie Playback ---
    createNftCardElement(nft) {
        const nftCard = document.createElement("div")
        nftCard.classList.add("nft-item-card")

        nftCard.innerHTML = `
      <div class="nft-image-placeholder">
        <div class="lottie-nft-container"></div>
      </div>
      <div class="nft-details">
        <p class="nft-name">${nft.name}</p>
        <p class="nft-id">${nft.id}</p>
        <button class="nft-price-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          ${nft.price.toFixed(2)} <span class="currency-text">UZS</span>
        </button>
      </div>
    `

        const lottieContainer = nftCard.querySelector(".lottie-nft-container")
        const lottieUrl = nft.lottieUrl // Directly use nft.lottieUrl

        if (lottieContainer && lottieUrl) {
            const animation = this.loadSingleLottie(lottieContainer, lottieUrl, false) // Autoplay false initially

            // Intersection Observer for visibility-based playback (mobile/general)
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (animation) {
                            if (entry.isIntersecting) {
                                animation.play()
                            } else {
                                animation.pause()
                            }
                        }
                    })
                },
                {
                    root: null, // viewport
                    rootMargin: "0px",
                    threshold: 0.5, // Play when 50% of the item is visible
                },
            )
            observer.observe(lottieContainer)

            // Mouse events for hover-based playback (desktop)
            nftCard.addEventListener("mouseenter", () => {
                if (animation) animation.play()
            })
            nftCard.addEventListener("mouseleave", () => {
                if (animation) animation.pause()
            })
        } else {
            console.warn(`Could not create Lottie for NFT ${nft.id}: container or URL missing.`)
        }

        return nftCard
    }

    loadMoreNfts() {
        if (this.isLoadingNfts || !this.hasMoreNfts) return

        this.isLoadingNfts = true
        this.loadingIndicator.style.display = "flex" // Show loading spinner

        // Removed setTimeout for immediate loading
        const startIndex = this.nftsLoadedCount
        const endIndex = startIndex + (this.nftsLoadedCount === 0 ? this.nftsPerLoad : this.nftsBatchSize)
        const nftsToLoad = this.mockNfts.slice(startIndex, endIndex)

        nftsToLoad.forEach((nft) => {
            const nftCardElement = this.createNftCardElement(nft)
            this.nftGrid.appendChild(nftCardElement)
        })

        this.nftsLoadedCount += nftsToLoad.length
        this.isLoadingNfts = false
        this.loadingIndicator.style.display = "none" // Hide loading spinner

        if (this.nftsLoadedCount >= this.mockNfts.length) {
            this.hasMoreNfts = false
            this.endOfListMessage.style.display = "flex" // Show end of list message
        }
    }

    setupInfiniteScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !this.isLoadingNfts && this.hasMoreNfts) {
                    this.loadMoreNfts()
                }
            },
            {
                root: this.mainApp, // Observe within the main scrollable area
                rootMargin: "200px", // Load when 200px from bottom
                threshold: 0.1,
            },
        )

        // Create a sentinel element at the bottom of the grid to observe
        const sentinel = document.createElement("div")
        sentinel.id = "infinite-scroll-sentinel"
        sentinel.style.height = "1px"
        sentinel.style.width = "100%"
        this.nftGrid.appendChild(sentinel)
        observer.observe(sentinel)
    }

    // --- Swipe to Refresh ---
    setupPullToRefresh() {
        if (!this.pullToRefreshIndicator) return

        this.mainApp.addEventListener("touchstart", this.handleTouchStart.bind(this), {passive: true})
        this.mainApp.addEventListener("touchmove", this.handleTouchMove.bind(this), {passive: false}) // Passive false to allow preventDefault
        this.mainApp.addEventListener("touchend", this.handleTouchEnd.bind(this))
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY
        this.pullToRefreshIndicator.style.transition = "" // Remove transition for immediate response
        this.pullToRefreshIndicator.style.opacity = "0"
        this.pullToRefreshIndicator.style.transform = "translateY(-100%)" // Ensure it's hidden initially
    }

    handleTouchMove(e) {
        this.currentY = e.touches[0].clientY
        const diff = this.currentY - this.startY

        // Only activate if at the very top of the scroll and pulling down
        if (this.mainApp.scrollTop === 0 && diff > 0 && !this.isRefreshing) {
            e.preventDefault() // Prevent scrolling when pulling down from top
            const pullDistance = Math.min(diff / 2, this.pullThreshold * 1.5) // Apply damping

            // Adjust transform to bring it into view from above
            this.pullToRefreshIndicator.style.transform = `translateY(${pullDistance - this.pullToRefreshIndicator.offsetHeight}px)`
            this.pullToRefreshIndicator.style.opacity = `${pullDistance / this.pullThreshold}`

            if (pullDistance >= this.pullThreshold) {
                this.pullToRefreshIndicator.classList.add("release")
                this.pullToRefreshIndicator.querySelector("span").textContent = "Yangilash uchun qo'yib yuboring"
            } else {
                this.pullToRefreshIndicator.classList.remove("release")
                this.pullToRefreshIndicator.querySelector("span").textContent = "Yangilash uchun pastga torting"
            }
        }
    }

    handleTouchEnd() {
        const diff = this.currentY - this.startY
        this.pullToRefreshIndicator.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out"

        if (this.mainApp.scrollTop === 0 && diff / 2 >= this.pullThreshold && !this.isRefreshing) {
            this.isRefreshing = true
            this.pullToRefreshIndicator.style.transform = "translateY(0)" // Show indicator fully
            this.pullToRefreshIndicator.style.opacity = "1"
            this.pullToRefreshIndicator.classList.add("refreshing")
            this.pullToRefreshIndicator.querySelector("svg").classList.add("spin")
            this.pullToRefreshIndicator.querySelector("span").textContent = "Yangilanmoqda..."

            this.performRefresh()
        } else {
            this.pullToRefreshIndicator.style.transform = "translateY(-100%)" // Hide it again
            this.pullToRefreshIndicator.style.opacity = "0"
            this.pullToRefreshIndicator.classList.remove("release")
        }

        this.startY = 0
        this.currentY = 0
    }

    performRefresh() {
        console.log("Performing refresh...")
        // Simulate data refresh
        setTimeout(() => {
            console.log("Refresh complete!")
            // Reset NFT list and reload for a "fresh" state
            this.nftGrid.innerHTML = "" // Clear current NFTs
            this.nftsLoadedCount = 0
            this.hasMoreNfts = true
            this.endOfListMessage.style.display = "none"
            this.loadMoreNfts() // Reload initial batch

            this.pullToRefreshIndicator.style.transform = "translateY(-100%)"
            this.pullToRefreshIndicator.style.opacity = "0"
            this.pullToRefreshIndicator.classList.remove("refreshing")
            this.pullToRefreshIndicator.querySelector("svg").classList.remove("spin")
            this.isRefreshing = false
            this.pullToRefreshIndicator.querySelector("span").textContent = "Yangilash uchun pastga torting"
        }, 1500)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new PortalsMarketplaceApp()
})
