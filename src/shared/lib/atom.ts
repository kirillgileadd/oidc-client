export class Atom<T> {
  private value: T;
  private listeners: Set<(value: T) => void> = new Set();

  constructor(value: T) {
    this.value = value;
  }

  listen = (callback: (value: T) => void) => {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  };

  get = () => {
    return this.value;
  };

  set = (value: T) => {
    this.value = value;
    this.listeners.forEach((listener) => listener(value));
  };

  derived<U>(mapFn: (value: T) => U): Atom<U> {
    const derivedAtom = new Atom<U>(mapFn(this.value));

    this.listen((newValue) => {
      const mapped = mapFn(newValue);
      derivedAtom.set(mapped);
    });

    return derivedAtom;
  }
}
