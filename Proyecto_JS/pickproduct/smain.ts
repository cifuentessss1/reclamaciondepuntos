// Product selection and interaction functionality
interface Product {
    id: string;
    points: number;
    selected: boolean;
}

class ExitoPointsExchange {
    private availablePoints = 7000;
    private selectedProducts: Set<string> = new Set();
    private products: Map<string, Product> = new Map();
    private confirmButton!: HTMLButtonElement;

    constructor() {
        this.init();
    }

    private init(): void {
        this.initProducts();
        this.initEventListeners();
        this.confirmButton = document.getElementById('confirmButton') as HTMLButtonElement;
        this.updateConfirmButton();
    }

    private initProducts(): void {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const element = card as HTMLElement;
            const id = element.dataset.id!;
            const points = Number.parseInt(element.dataset.points!);

            this.products.set(id, {
                id,
                points,
                selected: false
            });
        });
    }

    private initEventListeners(): void {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const element = card as HTMLElement;
                const productId = element.dataset.id!;
                this.toggleProductSelection(productId, element);
            });

            // Add hover effect enhancement
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card as HTMLElement);
            });

            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card as HTMLElement);
            });
        });

        // Confirm button functionality
        this.confirmButton?.addEventListener('click', () => {
            if (!this.confirmButton.disabled) {
                this.handleConfirmSelection();
            }
        });

        // Add animation on scroll
        this.addScrollAnimations();
    }

    private toggleProductSelection(productId: string, element: HTMLElement): void {
        const product = this.products.get(productId);
        if (!product) return;

        if (product.selected) {
            // Deselect product
            this.selectedProducts.delete(productId);
            product.selected = false;
            element.classList.remove('selected');
        } else {
            // Check if user has enough points
            const totalSelectedPoints = this.calculateTotalPoints();
            if (totalSelectedPoints + product.points <= this.availablePoints) {
                // Select product
                this.selectedProducts.add(productId);
                product.selected = true;
                element.classList.add('selected');
                this.addSelectionAnimation(element);
            } else {
                // Not enough points - show feedback
                this.showInsufficientPointsFeedback(element);
            }
        }

        this.updateConfirmButton();
        this.updatePointsDisplay();
    }

    private calculateTotalPoints(): number {
        let total = 0;
        this.selectedProducts.forEach(productId => {
            const product = this.products.get(productId);
            if (product) {
                total += product.points;
            }
        });
        return total;
    }

    private updateConfirmButton(): void {
        const hasSelection = this.selectedProducts.size > 0;
        this.confirmButton.disabled = !hasSelection;

        if (hasSelection) {
            const totalPoints = this.calculateTotalPoints();
            const selectedCount = this.selectedProducts.size;
            this.confirmButton.innerHTML = `
        <span>Confirmar Selección (${selectedCount} producto${selectedCount > 1 ? 's' : ''} - ${totalPoints} puntos)</span>
      `;
        } else {
            this.confirmButton.innerHTML = '<span>Confirmar Selección</span>';
        }
    }

    private updatePointsDisplay(): void {
        const totalSelected = this.calculateTotalPoints();
        const remaining = this.availablePoints - totalSelected;

        const pointsValue = document.querySelector('.points-value');
        if (pointsValue) {
            pointsValue.textContent = `${remaining} Puntos`;

            // Add visual feedback for low points
            if (remaining < 1000) {
                pointsValue.classList.add('low-points');
            } else {
                pointsValue.classList.remove('low-points');
            }
        }
    }

    private handleConfirmSelection(): void {
        const selectedProductsList = Array.from(this.selectedProducts);
        const totalPoints = this.calculateTotalPoints();

        // Create confirmation modal or alert
        const productNames = selectedProductsList.map(id => {
            const element = document.querySelector(`[data-id="${id}"] h3`);
            return element?.textContent || id;
        });

        const confirmationMessage = `
¿Confirmar el intercambio de los siguientes productos?

${productNames.map(name => `• ${name}`).join('\n')}

Total de puntos a utilizar: ${totalPoints}
Puntos restantes: ${this.availablePoints - totalPoints}
    `;

        if (confirm(confirmationMessage)) {
            this.processExchange();
        }
    }

    private processExchange(): void {
        // Simulate processing
        this.confirmButton.innerHTML = '<span>Procesando...</span>';
        this.confirmButton.disabled = true;

        setTimeout(() => {
            alert('¡Intercambio exitoso! Sus productos serán enviados pronto.');

            // Reset selection
            this.selectedProducts.clear();
            this.products.forEach(product => product.selected = false);

            // Update available points
            this.availablePoints -= this.calculateTotalPoints();

            // Reset UI
            document.querySelectorAll('.product-card.selected').forEach(card => {
                card.classList.remove('selected');
            });

            this.updateConfirmButton();
            this.updatePointsDisplay();
        }, 1500);
    }

    private addSelectionAnimation(element: HTMLElement): void {
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }

    private showInsufficientPointsFeedback(element: HTMLElement): void {
        const originalBorder = element.style.borderColor;
        element.style.borderColor = '#ef4444';
        element.style.animation = 'shake 0.5s ease-in-out';

        setTimeout(() => {
            element.style.borderColor = originalBorder;
            element.style.animation = '';
        }, 500);

        // Show temporary message
        const message = document.createElement('div');
        message.textContent = 'Puntos insuficientes';
        message.style.cssText = `
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    `;

        element.style.position = 'relative';
        element.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }

    private addHoverEffect(element: HTMLElement): void {
        const overlay = element.querySelector('.product-overlay') as HTMLElement;
        if (overlay) {
            overlay.style.opacity = '1';
        }
    }

    private removeHoverEffect(element: HTMLElement): void {
        const overlay = element.querySelector('.product-overlay') as HTMLElement;
        if (overlay) {
            overlay.style.opacity = '0';
        }
    }

    private addScrollAnimations(): void {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Observe product cards for scroll animations
        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });
    }
}

// Additional CSS animations via JavaScript
const additionalStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .low-points {
    background: #ef4444 !important;
    color: white !important;
    animation: pulse 1s infinite;
  }

  .product-card.animate-fade-in {
    animation: slideInUp 0.6s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ExitoPointsExchange();

    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
            const target = document.querySelector(href!);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});
