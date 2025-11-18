import React, { useCallback, useEffect, useRef, useState } from 'react';
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
      return;
    }

    let animationFrame;
    let startTime = null;
    const { start, end } = projectile;
    const arcHeight = Math.max(80, Math.abs(end.x - start.x) * 0.25);

    const animate = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;

      if (elapsed <= duration) {
        const t = elapsed / duration;
        const easedT = t * t * (3 - 2 * t); // smoothstep easing
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
    <span ref={elementRef} className="emoji-projectile">
      {projectile.emoji}
    </span>
  );
};

const EmojiLayer = ({ projectiles, onComplete }) => {
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

  if (!layerNode) {
    return null;
  }

  return createPortal(
    <div className="emoji-layer">
      {projectiles.map((projectile) => (
        <EmojiProjectile
          key={projectile.id}
          projectile={projectile}
          onComplete={onComplete}
        />
      ))}
    </div>,
    layerNode
  );
};

const UserList = ({ users, revealed, currentUser }) => {
  const [projectiles, setProjectiles] = useState([]);
  const userRefs = useRef(new Map());

  const removeProjectile = useCallback((projectileId) => {
    setProjectiles((prev) => prev.filter((item) => item.id !== projectileId));
  }, []);

  const handleUserClick = useCallback((user) => {
    const userNode = userRefs.current.get(user.id);
    if (!userNode) {
      return;
    }

    const targetRect = userNode.getBoundingClientRect();
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

    const projectile = {
      id: `${Date.now()}-${Math.random()}`,
      emoji: user.emoji || DEFAULT_EMOJI,
      start: startPosition,
      end: endPosition
    };

    setProjectiles((prev) => [...prev, projectile]);
  }, []);

  return (
    <>
      <div className="users-list">
        {users.map((user) => (
          <div
            key={user.id}
            ref={(node) => {
              if (node) {
                userRefs.current.set(user.id, node);
              } else {
                userRefs.current.delete(user.id);
              }
            }}
            className={`user ${user.voted ? 'voted' : ''} ${
              currentUser && user.id === currentUser.id ? 'current-user' : ''
            }`}
            onClick={() => handleUserClick(user)}
          >
            <div className="user-name">
              {user.name}
              {currentUser && user.id === currentUser.id && (
                <span className="you-badge"> (Вы)</span>
              )}
            </div>
            {user.voted && (
              <div className="user-vote">
                {revealed ? user.vote : '✓'}
              </div>
            )}
          </div>
        ))}
      </div>
      {projectiles.length > 0 && (
        <EmojiLayer projectiles={projectiles} onComplete={removeProjectile} />
      )}
    </>
  );
};

export default UserList;