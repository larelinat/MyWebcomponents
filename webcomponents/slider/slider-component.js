class Slider extends HTMLElement {

    #page = 1;
    #pageBlock;
    #total = 1;
    #totalBlock;

    #arrowLeft;
    #arrowRight;

    #current;
    #next;
    #prev;

    #shadow;
    #template;
    #slider;

    constructor() {
        super();

        Object.defineProperty(this, 'page', {
            get: function () {
                return this.#page;
            },
            set: function (value) {
                this.#page = value;
                if (this.#pageBlock) {
                    this.#pageBlock.innerHTML = this.#page;
                }
            }
        });


        Object.defineProperty(this, 'total', {
            get: function () {
                return this.#total;
            },
            set: function (value) {
                this.#total = value;
                if (this.#totalBlock) {
                    this.#totalBlock.innerHTML = this.#total;
                }
            }
        });

        this.#template = document.createElement('template');
        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#template.innerHTML = `
            <style>
                :host {
                      position: relative;
                      display: flex;
                      flex-direction: column;
                                                                       
                }
                :host .head {                   
                                       
                    align-self: stretch;
                }
                @media(max-width: 479px) {
                    :host .head {
                        width: 240px;
                    }
                }
                
                :host .head.none {
                    display: none;   
                }
                
                :host .arrow-block.default {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    position: absolute;
                    right: 0;
                    top: 0;
                    z-index: 99;
                }
                
                :host .arrow-block.middle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    position: absolute;
                    width: 100%;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }                             
                
                :host .arrow-block .arrow {                    
                      stroke-width: 2px;
                      stroke: #2D2D2D;
                      cursor: pointer;
                      
                }
                
                :host .arrow-block .arrow img {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    cursor:pointer;
                }
                
                @media(max-width: 1199px) {
                    :host .arrow-block .arrow img {
                        width: 32px;
                        height: 32px;
                    }
                }
                :host .arrow-block .arrow_right {
                        transform: rotateY(180deg);                  
                }
              
                :host .slider {
                    display: flex;
                    overflow: hidden;
                    flex-direction: row;
                    gap: 24px;                              
                }
                
                :host .slider slot {
                    flex-grow: 1;
                    width: 100%;                    
                }
                
                :host .slider.default slot::slotted(div) {
                   /* background: aqua !important;*/
                   min-width: calc(100% / 4 - 18px);
                   box-sizing: border-box !important;
                }
                
                @media(max-width: 1599px) {
                    :host .slider.default slot::slotted(div) {
                        min-width: calc(100% / 3 - 16px);
                    }
                }
                @media(max-width: 1199px) {
                    :host .slider.default slot::slotted(div) {
                        min-width: calc(100% / 2 - 12px);
                    }
                }
                @media(max-width: 639px) {
                    :host .slider.default slot::slotted(div) {
                        min-width: calc(100% / 1);
                    }
                }
                
                :host .slider.full-width slot::slotted(div) {
                    min-width: 100%;              
                }
                
                :host .slider.full-width slot::slotted(div) > *{
                   /* width: 100%;     */         
                }
                
                :host .pagination {
                   /* position: absolute;
                    bottom: 0;
                    left: 68px;*/
                }
                
                :host .pagination.none {
                    display: none;
                }
                
                :host .arrows.none {
                    display: none;
                }
              
            </style>
        `;
        this.#template.innerHTML += `
            <div class="head">             
                <slot name="header"></slot>
            </div>                
            <slot class="arrows" name="arrows"></slot>
            <slot class="pagination" name="pagination">              
            </slot>   
            <div class="slider">
                <slot></slot>                            
            </div>
        `;
    }

    static get observedAttributes() {
        return [];
    }

    #updateArrowVisibility() {
        // Скрываем левую стрелку, если текущий индекс равен 0
        if (this.#arrowLeft) {
            this.#arrowLeft.style.visibility = this.#page === 1 ? 'hidden' : 'visible';
        }

        // Скрываем правую стрелку, если достигнут конец слайдера
        if (this.#arrowRight) {
            this.#arrowRight.style.visibility = this.#page >= this.#total ? 'hidden' : 'visible';
        }
    }

    #startPagination() {
        const sliderItems = this.#shadow.querySelector('.slider slot');
        const pagination = this.#shadow.querySelector('slot[name="pagination"]');

        sliderItems.addEventListener('slotchange', (e) => {
            this.total = sliderItems.assignedElements().length;
            this.page = 1;
        });

        pagination.addEventListener('slotchange', (e) => {
            if (pagination.assignedElements().length > 0 && this.getAttribute('pagination') !== null) {
                const paginationRef = pagination.assignedElements()[0];
                this.#pageBlock = paginationRef.querySelector('#pagination_current');
                this.#totalBlock = paginationRef.querySelector('#pagination_total');
                this.total = sliderItems.assignedElements().length;
                this.page = 1;
            }
        });
    }

    #startNavigation() {
        const arrows = this.#shadow.querySelector('slot[name="arrows"]');
        const sliderItems = this.#shadow.querySelector('.slider slot');

        arrows.addEventListener('slotchange', (e) => {
            const arrowBlock = arrows.assignedElements()[0];
            this.#arrowLeft = arrowBlock.querySelector('#arrowL');
            this.#arrowRight = arrowBlock.querySelector('#arrowR');

            this.#arrowLeft.addEventListener('click', () => {
                this.#moveLeft();
            });

            this.#arrowRight.addEventListener('click', () => {
                this.#moveRight();
            });

            this.#updateArrowVisibility();
        });

        sliderItems.addEventListener('slotchange', (e) => {
            e.target.assignedElements()[0].classList.add("current");
            this.#current = sliderItems.assignedElements().find(el => el.classList.contains("current"));
            this.#next = this.#current.nextElementSibling;
            this.#prev = this.#current.previousElementSibling;
            this.#updateArrowVisibility();
        });

        this.#slider = this.#shadow.querySelector('.slider');
    }

    #moveRight() {
        if (this.page < this.total) {
            this.#current.classList.remove("current");
            this.#next.classList.add("current");
            this.#current = this.#next;
            this.#next = this.#current.nextElementSibling;
            this.#prev = this.#current.previousElementSibling;

            this.#slider.scrollTo({
                left: this.#current.offsetLeft,
                behavior: 'smooth'
            });

            this.page++;
            this.#updateArrowVisibility();
        }
    };

    #moveLeft() {
        if (this.page > 1) {
            this.#current.classList.remove("current");
            this.#prev.classList.add("current");
            this.#current = this.#prev;
            this.#prev = this.#current.previousElementSibling;
            this.#next = this.#current.nextElementSibling;

            this.#slider.scrollTo({
                left: this.#current.offsetLeft,
                behavior: 'smooth'
            });

            this.page--;
            this.#updateArrowVisibility();
        }
    }

    connectedCallback() {
        this.#shadow.appendChild(this.#template.content.cloneNode(true));

        this.#startPagination();
        this.#startNavigation();

        if (this.getAttribute('variant') === 'full-width') {
            this.#shadow.querySelector('.slider').classList.add('full-width');
        } else {
            this.#shadow.querySelector('.slider').classList.add('default');
        }


        if (this.getAttribute('without-header') !== null) {
            this.#shadow.querySelector('.head').classList.add('none');
        }

        if (this.getAttribute('pagination') === null) {
            this.#shadow.querySelector('.pagination').classList.add('none');
        }

        if (this.getAttribute('arrows') === null) {
            this.#shadow.querySelector('.arrows').classList.add('none');
        }

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const handleSwipe = () => {
            if (Math.abs(touchEndX - touchStartX) > Math.abs(touchEndY - touchStartY)) {
                if (touchEndX < touchStartX) {
                    this.#moveRight();
                }
                if (touchEndX > touchStartX) {
                    this.#moveLeft();
                }
            }
        };

        this.#slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        this.#slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });

        this.#slider.addEventListener('touchmove', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            if (Math.abs(touchEndX - touchStartX) > Math.abs(touchEndY - touchStartY)) {
                e.preventDefault();
            }
        });


        window.addEventListener('resize', () => {
            this.#updateArrowVisibility();
        });

    }

    attributeChangedCallback(name, oldValue, newValue) {

    }
}

window.customElements.define('block-slider', Slider);