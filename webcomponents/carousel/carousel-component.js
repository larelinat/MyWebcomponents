window.customElements.define('carousel-block', class extends HTMLElement {
    #template;
    #shadow;
    #carousel;
    #timer;
    #gap;

    #current;
    #next;
    #prev;
    #removeElements = [];
    #countRemove;

    constructor() {
        super();

        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#template = document.createElement('template');
        this.#template.innerHTML = `
        <style>
            :host {
                display: flex;
                flex-direction: column;
                position: relative;
                height: 100%;
                width: 100%;
            }
            
            :host slot {
                width: max-content;
                
            }
            
            :host .carousel {              
                gap: var(--carousel-gap, 20px);
                display: flex;
                overflow: hidden;
                flex-direction: row;   
                align-items: flex-end;
                height: 100%;
            }
            
        </style>
        <div class="carousel">
            <slot></slot>
        </div>
        `;
    }

    #carouselInit(timeout) {
        this.#carousel = this.#shadow.querySelector('.carousel');
        const items = this.#carousel.querySelector('slot').assignedElements();
        if (items.length > 0) {
            this.#current = 0;
            items[0].classList.add('current');
            items[1].classList.add('next');
            this.#current = items[0];
            this.#next = items[1];
        }
        if (!this.gap) {
            this.#gap = 20;
        }
        this.#moveRight();
        this.#moveRight();
        this.#timer = setInterval(() => {
            this.#moveRight();
        }, timeout * 1000);
    }

    connectedCallback() {
        let init = true;
        this.#shadow.appendChild(this.#template.content.cloneNode(true));
        if (this.getAttribute('gap') && this.getAttribute('gap').length > 0) {
            this.#gap = Number(this.getAttribute('gap'));
            this.setProperty('--carousel-gap', `${this.getAttribute('gap')}px`);
        }
        const timeout = Number(this.getAttribute('timeout')) || 3;
        this.#shadow.querySelector('slot').addEventListener('slotchange', () => {
            if (init) {
                this.#carouselInit(timeout);
                init = false;
            }
        });
    }

    #moveRight() {
        if (this.#current && this.#next) {
            if (this.#prev) {
                this.#prev.classList.remove('prev');
            }
            this.#next.classList.remove('next');
            this.#current.classList.remove('current');
            this.#prev = this.#current;

            this.#current = this.#next;
            this.#next = this.#next.nextElementSibling;
            this.#current.classList.add('current');
            this.#next.classList.add('next');


            const padding = parseFloat(getComputedStyle(this).getPropertyValue('--theme-page-width-padding')) || 0;
            const margin = this.previousElementSibling ? parseFloat(getComputedStyle(this.previousElementSibling).marginLeft) : 0;

            this.appendChild(this.#prev.cloneNode(true));
            this.#prev.classList.add('prev');

            const offset = this.#current.offsetLeft - padding - margin;
            this.#carousel.scrollTo({
                left: offset,
                behavior: 'smooth'
            });

            this.#current.addEventListener('animationend', () => {
                this.#remove(this.#prev, padding, margin);
            }, {once: true});
        }
    }

    #remove(element, padding, margin) {
        this.#removeElements.push({
            element,
            lifetime: 3
        });
        this.#removeElements.forEach((el) => {
            if (el.lifetime <= 0) {
                this.removeChild(el.element);
                this.#removeElements.splice(this.#removeElements.indexOf(el), 1);
            } else {
                el.lifetime--;
            }
        });
        this.#carousel.scrollTo({
            left: this.#current.offsetLeft - padding - margin,
        });
    }


});