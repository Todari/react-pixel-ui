import { DOMObserver } from './dom-observer';
import { pixelateCanvasData, createCSSFilterPixelStyle, getElementRenderSize } from './utils';
import { parseCSS } from './css-parser';
import type { DOMPixelateOptions, PixelatedStyle, PixelateInstance } from './types';



/**
 * DOM 요소를 픽셀화하는 메인 클래스
 */
export class DOMPixelate implements PixelateInstance {
  private element: HTMLElement;
  private options: Required<DOMPixelateOptions>;
  private observer?: DOMObserver;
  private currentPixelatedStyle: PixelatedStyle | null = null;
  private isDestroyed = false;
  private updatePromise: Promise<void> | null = null;

  constructor(options: DOMPixelateOptions) {
    this.element = options.element;
    this.options = {
      unitPixel: 4,
      quality: 'medium',
      smooth: false,
      updateMode: 'debounced',
      debounceMs: 150,
      fallbackToCSSFilter: true,
      css: '',
      onUpdate: () => {},
      onError: () => {},
      ...options,
    };

    this.initialize();
  }

  private initialize(): void {
    // 초기 CSS 적용
    if (this.options.css) {
      this.applyCSSToElement(this.options.css);
    }

    // DOM 관찰자 설정
    this.setupObserver();

    // 초기 픽셀화 실행
    this.update();
  }

  private setupObserver(): void {
    if (this.options.updateMode === 'manual') return;

    this.observer = new DOMObserver(this.element, {
      onResize: () => this.handleUpdate(),
      onMutation: () => this.handleUpdate(),
      onStyleChange: () => this.handleUpdate(),
      debounceMs: this.options.debounceMs,
    });
  }

  private handleUpdate(): void {
    if (this.isDestroyed) return;
    
    if (this.options.updateMode === 'realtime') {
      this.update();
    } else if (this.options.updateMode === 'debounced') {
      // debounce는 DOMObserver에서 처리됨
      this.update();
    }
  }

  private applyCSSToElement(css: string): void {
    const styles = parseCSS(css);
    Object.assign(this.element.style, styles);
  }

  /**
   * html2canvas를 사용한 고품질 픽셀화
   */
  private async pixelateWithCanvas(): Promise<PixelatedStyle> {
    const { width, height } = getElementRenderSize(this.element);
    
    if (width === 0 || height === 0) {
      throw new Error('요소의 크기가 0입니다');
    }

    try {
      // html2canvas 동적 import
      const html2canvas = (await import('html2canvas' as any)).default;
      
      // html2canvas 옵션
      const canvasOptions = {
        allowTaint: true,
        useCORS: true,
        scale: 1,
        width,
        height,
        backgroundColor: null,
        removeContainer: true,
        imageTimeout: 5000,
        logging: false,
      };

      // DOM을 Canvas로 변환
      const canvas = await html2canvas(this.element, canvasOptions);
      
      // Canvas 픽셀화 처리
      const pixelatedCanvas = pixelateCanvasData(canvas, this.options.unitPixel);
      
      // 결과 스타일 생성
      const dataURL = pixelatedCanvas.toDataURL('image/png');
      
      return {
        backgroundImage: `url(${dataURL})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        imageRendering: this.options.smooth ? 'auto' : 'pixelated',
        position: 'relative',
        zIndex: '1',
        pointerEvents: 'none',
      };
    } catch (error) {
      throw new Error(`Canvas 픽셀화 실패: ${error}`);
    }
  }

  /**
   * CSS Filter 기반 폴백 픽셀화
   */
  private pixelateWithCSSFilter(): PixelatedStyle {
    const filterStyles = createCSSFilterPixelStyle(
      this.options.unitPixel,
      this.options.smooth
    );

    return {
      backgroundImage: 'none',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left',
      imageRendering: filterStyles.imageRendering,
      position: 'relative',
      zIndex: '1',
      pointerEvents: 'auto',
      transform: filterStyles.transform,
      transformOrigin: filterStyles.transformOrigin,
      filter: filterStyles.filter,
    };
  }

  /**
   * 픽셀화 업데이트 실행
   */
  async update(): Promise<void> {
    if (this.isDestroyed) return;

    // 이미 업데이트 중이면 기존 Promise 반환
    if (this.updatePromise) {
      return this.updatePromise;
    }

    this.updatePromise = this.performUpdate();
    
    try {
      await this.updatePromise;
    } finally {
      this.updatePromise = null;
    }
  }

  private async performUpdate(): Promise<void> {
    try {
      let pixelatedStyle: PixelatedStyle;

      // Canvas 기반 픽셀화 시도
      try {
        pixelatedStyle = await this.pixelateWithCanvas();
      } catch (canvasError) {
        if (this.options.fallbackToCSSFilter) {
          console.warn('Canvas 픽셀화 실패, CSS Filter로 폴백:', canvasError);
          pixelatedStyle = this.pixelateWithCSSFilter();
        } else {
          throw canvasError;
        }
      }

      this.currentPixelatedStyle = pixelatedStyle;
      this.options.onUpdate(pixelatedStyle);
      
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.options.onError(errorObj);
    }
  }

  /**
   * 현재 픽셀화된 스타일 반환
   */
  getPixelatedStyle(): PixelatedStyle | null {
    return this.currentPixelatedStyle;
  }

  /**
   * 옵션 업데이트
   */
  updateOptions(newOptions: Partial<DOMPixelateOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // CSS가 변경된 경우 적용
    if (newOptions.css) {
      this.applyCSSToElement(newOptions.css);
    }
    
    // 업데이트 실행
    this.update();
  }

  /**
   * 수동 트리거
   */
  trigger(): void {
    this.update();
  }

  /**
   * 인스턴스 정리
   */
  destroy(): void {
    this.isDestroyed = true;
    
    if (this.observer) {
      this.observer.destroy();
      this.observer = undefined;
    }
    
    this.currentPixelatedStyle = null;
    this.updatePromise = null;
  }
}

/**
 * DOM 요소를 픽셀화하는 팩토리 함수
 */
export function createDOMPixelate(options: DOMPixelateOptions): PixelateInstance {
  return new DOMPixelate(options);
}