import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_EMOJI = '💩';

const EmojiProjectile = ({
  projectile,
  onComplete,
  duration = 1100,
  dropDuration = 280
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    let animationFrame;
    let startTime = null;
    let { start, end } = projectile;

    // FIXME: без поправки на размеры элемента он прилетает левым верхним углом
    // в центр карточки. Через transform-origin поправить не получилось :(
    // Почему делить на 4, а не на 2, тоже не понял, зато теперь центр эмоджи летит 
    // в центр карточки
    const widthCorrection = element.getBoundingClientRect().width / 4;
    const heightCorrection = element.getBoundingClientRect().height / 4;
    end.x = end.x - widthCorrection;
    end.y = end.y - heightCorrection;

    const arcHeight = Math.max(80, Math.abs(end.x - start.x) * 0.25);

    const animate = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;

      if (elapsed <= duration) {
        const t = elapsed / duration;
        const easedT = t * t * (3 - 2 * t);
        const currentX = start.x + (end.x - start.x) * easedT;
        const parabolaYOffset = -arcHeight * Math.sin(Math.PI * easedT);
        const currentY = start.y + (end.y - start.y) * easedT + parabolaYOffset;
        const wobble = Math.sin(easedT * Math.PI * 3) * 8;

        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${wobble}deg)`;
        element.style.opacity = Math.min(1, easedT * 1.4);
      } else if (elapsed <= duration + dropDuration) {
        const dropT = (elapsed - duration) / dropDuration;
        const easedDrop = dropT * dropT;
        const currentY = end.y + 40 * easedDrop;
        element.style.transform = `translate3d(${end.x}px, ${currentY}px, 0) rotate(12deg) scale(${1 - dropT * 0.1})`;
        element.style.opacity = 1 - dropT * 0.8;
      } else {
        onComplete(projectile.id);
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [projectile, duration, dropDuration, onComplete]);

  return (
    <span ref={elementRef} className={`emoji-projectile ${projectile.isLarge && "emoji-projectile--big"}`}>
      {projectile.emoji}
    </span>
  );
};

const EmojiThrowLayer = forwardRef(({ defaultEmoji = DEFAULT_EMOJI }, ref) => {
  const [projectiles, setProjectiles] = useState([]);
  const [layerNode, setLayerNode] = useState(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const node = document.createElement('div');
    document.body.appendChild(node);
    setLayerNode(node);

    return () => {
      document.body.removeChild(node);
    };
  }, []);

  const removeProjectile = useCallback((id) => {
    setProjectiles((prev) => prev.filter((projectile) => projectile.id !== id));
  }, []);

  const launchProjectile = useCallback(
    (targetRect, emoji) => {
      if (!targetRect || typeof window === 'undefined') {
        return;
      }

      const endPosition = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2
      };

      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const viewportWidth = window.innerWidth;
      const startPosition = {
        x: direction === 'left' ? -120 : viewportWidth + 120,
        y: endPosition.y + (Math.random() * 160 - 80)
      };

      const isLarge = Math.random() > 0.9;

      const projectile = {
        id: `${Date.now()}-${Math.random()}`,
        emoji: emoji || defaultEmoji,
        start: startPosition,
        end: endPosition,
        isLarge
      };

      setProjectiles((prev) => [...prev, projectile]);
    },
    [defaultEmoji]
  );

  useImperativeHandle(
    ref,
    () => ({
      throwAt(targetRect, emoji) {
        launchProjectile(targetRect, emoji);
      }
    }),
    [launchProjectile]
  );

  if (!layerNode) {
    return null;
  }

  return createPortal(
    <div className="emoji-layer">
      {projectiles.map((projectile) => (
        <EmojiProjectile
          key={projectile.id}
          projectile={projectile}
          onComplete={removeProjectile}
        />
      ))}
    </div>,
    layerNode
  );
});

EmojiThrowLayer.displayName = 'EmojiThrowLayer';

export default EmojiThrowLayer;

