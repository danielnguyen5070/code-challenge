import type { HTMLAttributes, ReactNode } from 'react';
import { createElement } from 'react';

type MotionProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  layout?: boolean;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
};

function createMotionComponent(tag: string) {
  return function MotionComponent({
    children,
    layout: _layout,
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    whileHover: _whileHover,
    whileTap: _whileTap,
    ...rest
  }: MotionProps) {
    return createElement(tag, rest, children);
  };
}

export const motion = {
  section: createMotionComponent('section'),
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  header: createMotionComponent('header'),
};

export function AnimatePresence({ children }: { children: ReactNode }) {
  return children;
}
