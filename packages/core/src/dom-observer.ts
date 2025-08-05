import { debounce } from './utils';

export interface DOMObserverOptions {
  onResize?: () => void;
  onMutation?: () => void;
  onStyleChange?: () => void;
  debounceMs?: number;
}

/**
 * DOM 변화를 감지하는 관찰자 클래스
 */
export class DOMObserver {
  private element: HTMLElement;
  private options: DOMObserverOptions;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private intersectionObserver?: IntersectionObserver;
  private isDestroyed = false;

  constructor(element: HTMLElement, options: DOMObserverOptions = {}) {
    this.element = element;
    this.options = {
      debounceMs: 100,
      ...options,
    };

    this.setupObservers();
  }

  private setupObservers(): void {
    const {
      onResize,
      onMutation,
      onStyleChange,
      debounceMs = 100,
    } = this.options;

    // ResizeObserver - 크기 변화 감지
    if (onResize && typeof ResizeObserver !== 'undefined') {
      const debouncedResize = debounce(onResize, debounceMs);
      this.resizeObserver = new ResizeObserver((entries) => {
        if (this.isDestroyed) return;
        for (const entry of entries) {
          if (entry.target === this.element) {
            debouncedResize();
            break;
          }
        }
      });
      this.resizeObserver.observe(this.element);
    }

    // MutationObserver - DOM 구조 및 속성 변화 감지
    if ((onMutation || onStyleChange) && typeof MutationObserver !== 'undefined') {
      const debouncedMutation = debounce(() => {
        if (onMutation) onMutation();
      }, debounceMs);
      
      const debouncedStyleChange = debounce(() => {
        if (onStyleChange) onStyleChange();
      }, debounceMs);

      this.mutationObserver = new MutationObserver((mutations) => {
        if (this.isDestroyed) return;
        
        let hasStructuralChange = false;
        let hasStyleChange = false;

        for (const mutation of mutations) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            hasStructuralChange = true;
          } else if (
            mutation.type === 'attributes' &&
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')
          ) {
            hasStyleChange = true;
          }
        }

        if (hasStructuralChange && onMutation) {
          debouncedMutation();
        }
        if (hasStyleChange && onStyleChange) {
          debouncedStyleChange();
        }
      });

      this.mutationObserver.observe(this.element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeFilter: ['style', 'class'],
      });
    }

    // IntersectionObserver - 가시성 변화 감지 (성능 최적화)
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        if (this.isDestroyed) return;
        // 요소가 보이지 않을 때는 업데이트를 중단할 수 있음
        // 현재는 로깅만 수행
        const isVisible = entries[0]?.isIntersecting;
        if (!isVisible) {
          // console.log('Element is not visible, skipping updates');
        }
      });
      this.intersectionObserver.observe(this.element);
    }
  }

  /**
   * 관찰자 정리
   */
  destroy(): void {
    this.isDestroyed = true;
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
  }

  /**
   * 수동으로 업데이트 트리거
   */
  trigger(type: 'resize' | 'mutation' | 'style'): void {
    if (this.isDestroyed) return;
    
    switch (type) {
      case 'resize':
        this.options.onResize?.();
        break;
      case 'mutation':
        this.options.onMutation?.();
        break;
      case 'style':
        this.options.onStyleChange?.();
        break;
    }
  }
}