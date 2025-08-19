export class RacingAnimations {
  static createCarMovementAnimation(element, trackPosition, duration = 1000) {
    if (!element) return null;

    const startPosition = parseFloat(element.style.left) || 0;
    const endPosition = Math.min(trackPosition, 100);
    
    return element.animate([
      { left: `${startPosition}%` },
      { left: `${endPosition}%` }
    ], {
      duration,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      fill: 'forwards'
    });
  }

  static createGaugeAnimation(element, value, maxValue = 100, duration = 2000) {
    if (!element) return null;

    const percentage = Math.min((value / maxValue) * 100, 100);
    const circumference = 2 * Math.PI * 120; // Assuming radius of 120
    const offset = circumference - (percentage / 100) * circumference * 0.75;

    return element.animate([
      { strokeDashoffset: circumference },
      { strokeDashoffset: offset }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  static createPulseAnimation(element, color = '#FF6B35') {
    if (!element) return null;

    return element.animate([
      { transform: 'scale(1)', backgroundColor: color, opacity: 1 },
      { transform: 'scale(1.1)', backgroundColor: color, opacity: 0.8 },
      { transform: 'scale(1)', backgroundColor: color, opacity: 1 }
    ], {
      duration: 2000,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  }

  static createSlideInAnimation(element, direction = 'up', duration = 500) {
    if (!element) return null;

    const transforms = {
      up: ['translateY(20px)', 'translateY(0)'],
      down: ['translateY(-20px)', 'translateY(0)'],
      left: ['translateX(-20px)', 'translateX(0)'],
      right: ['translateX(20px)', 'translateX(0)']
    };

    return element.animate([
      { 
        transform: transforms[direction][0], 
        opacity: 0 
      },
      { 
        transform: transforms[direction][1], 
        opacity: 1 
      }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  static createCountUpAnimation(element, startValue = 0, endValue = 100, duration = 1500) {
    if (!element) return null;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;
      
      element.textContent = Math.round(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  static createRacingLineAnimation(pathElement, duration = 3000) {
    if (!pathElement) return null;

    const pathLength = pathElement.getTotalLength();
    
    pathElement.style.strokeDasharray = pathLength;
    pathElement.style.strokeDashoffset = pathLength;

    return pathElement.animate([
      { strokeDashoffset: pathLength },
      { strokeDashoffset: 0 }
    ], {
      duration,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
  }

  static createShakeAnimation(element, intensity = 5, duration = 500) {
    if (!element) return null;

    const positions = [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${intensity}px, 0)` },
      { transform: `translate(-${intensity}px, 0)` },
      { transform: `translate(0, ${intensity}px)` },
      { transform: `translate(0, -${intensity}px)` },
      { transform: 'translate(0, 0)' }
    ];

    return element.animate(positions, {
      duration,
      iterations: 2,
      easing: 'ease-in-out'
    });
  }

  static createSpinAnimation(element, duration = 1000, iterations = 1) {
    if (!element) return null;

    return element.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], {
      duration,
      iterations,
      easing: 'ease-in-out'
    });
  }

  static createBouncingAnimation(element, height = 10, duration = 800) {
    if (!element) return null;

    return element.animate([
      { transform: 'translateY(0px)' },
      { transform: `translateY(-${height}px)` },
      { transform: 'translateY(0px)' }
    ], {
      duration,
      iterations: Infinity,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
  }

  static createProgressBarAnimation(element, percentage, duration = 1500) {
    if (!element) return null;

    return element.animate([
      { width: '0%' },
      { width: `${Math.min(percentage, 100)}%` }
    ], {
      duration,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      fill: 'forwards'
    });
  }

  static staggeredAnimation(elements, animationFunction, staggerDelay = 100) {
    if (!elements || !elements.length) return [];

    return elements.map((element, index) => {
      setTimeout(() => {
        animationFunction(element);
      }, index * staggerDelay);
    });
  }

  static sequenceAnimations(animations) {
    return animations.reduce((promise, animation) => {
      return promise.then(() => {
        return new Promise(resolve => {
          animation.addEventListener('finish', resolve, { once: true });
        });
      });
    }, Promise.resolve());
  }

  static createFloatingAnimation(element, amplitude = 5, period = 2000) {
    if (!element) return null;

    return element.animate([
      { transform: 'translateY(0px)' },
      { transform: `translateY(-${amplitude}px)` },
      { transform: 'translateY(0px)' },
      { transform: `translateY(${amplitude}px)` },
      { transform: 'translateY(0px)' }
    ], {
      duration: period,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  }
}
