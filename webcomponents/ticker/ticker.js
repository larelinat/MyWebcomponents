window.customElements.define('ticker-block', class extends HTMLElement {

    #shadow;
    #template;
    #tickerLine1;
    #tickerLine2;
    constructor() {
        super();
        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#template = document.createElement('template');
        this.#template.innerHTML = `
        <style>
            :host {
                overflow: hidden;
                display: flex;
                align-items: center;
                height: 100%;   
            }
                                  
             :host .ticker {
                flex-shrink: 0;
                display: flex;
                overflow: hidden;   
                white-space: nowrap;   
                height: max-content;                                 
                
             }
             
            :host .tickerLine1, :host .tickerLine2 {
                display: inline-flex;
                gap: var(--ticker-gap, 10px);
                padding-right: var(--ticker-gap, 10px);                                
            }
            
            :host .tickerLine1 {
                animation: scroll1 20s linear infinite;
                animation-delay: -20s;           
            }
            
            :host .tickerLine2 {
                animation: scroll2 20s linear infinite;
                animation-delay: -10s;           
            }
            
            @keyframes scroll1 {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(-100%);
                }
            }
            
            @keyframes scroll2 {
                from {
                    transform: translateX(0%);
                }
                to {
                    transform: translateX(-200%);
                }
            }
                       
            :host .separator {
                display: inline-block;
                padding: 0 10px;
            }                      
        </style>`;
        this.#template.innerHTML += `
            <div class='ticker'>
                <slot></slot>               
            </div>
           
        `;
        this.#shadow.appendChild(this.#template.content.cloneNode(true));

    }

    connectedCallback() {
        const slot = this.#shadow.querySelector('slot');
        const ticker = this.#shadow.querySelector('.ticker');

        let init = false;

        let separator = null;
        if(this.getAttribute('separator-image') && this.getAttribute('separator-image').length > 0) {
            separator = document.createElement('img');
            separator.src = this.getAttribute('separator-image');
            separator.classList.add('separator');
        }
        else if (this.getAttribute('separator').length && this.getAttribute('separator').length > 0) {
            separator = document.createElement('span');
            separator.classList.add('separator');
            separator.textContent = this.getAttribute('separator') ?? '|';
        }


        slot.addEventListener('slotchange', () => {
            if(init) return;
            const blocks = [];
            slot.assignedElements().forEach(block => {
                blocks.push(block.cloneNode(true));
                if (separator) {
                    blocks.push(separator.cloneNode(true));
                }
            });
            ticker.innerHTML = '';
            this.innerHTML = '';
            this.#tickerLine1 = ticker.appendChild(document.createElement('slot'));
            this.#tickerLine2 = ticker.appendChild(document.createElement('slot'));
            this.#tickerLine1.name = 'tickerLine1';
            this.#tickerLine1.classList.add('tickerLine1');
            this.#tickerLine2.name = 'tickerLine2';
            this.#tickerLine2.classList.add('tickerLine2');

            blocks.forEach((block, index) => {
                const blockLine1 = this.appendChild(block.cloneNode(true));
                blockLine1.slot = 'tickerLine1';
                const blockLine2 = this.appendChild(block.cloneNode(true));
                blockLine2.slot = 'tickerLine2';
            });
            init = true;
        });
        this.addEventListener('mouseenter', () => {
            this.#pause();
        });
        this.addEventListener('mouseleave', () => {
            this.#resume();
        });
    }

    #pause() {
        this.#tickerLine1.style.animationPlayState = 'paused';
        this.#tickerLine2.style.animationPlayState = 'paused';
    }

    #resume() {
        this.#tickerLine1.style.animationPlayState = 'running';
        this.#tickerLine2.style.animationPlayState = 'running';
    }


});