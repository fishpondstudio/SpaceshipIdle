/**
 * A fixed-size circular buffer implementation that efficiently manages a collection of elements.
 * When the buffer is full, adding new elements overwrites the oldest ones.
 */
export class RingBuffer<T> {
   private buffer: Array<T | undefined>;
   private head = 0; // Points to the next position to write
   private tail = 0; // Points to the oldest element
   private _size = 0; // Current number of elements in the buffer

   /**
    * Creates a new RingBuffer with the specified capacity.
    * @param capacity The maximum number of elements the buffer can hold
    */
   constructor(private capacity: number) {
      if (capacity <= 0) {
         throw new Error("Capacity must be greater than 0");
      }
      this.buffer = new Array<T | undefined>(capacity);
   }

   /**
    * Adds an element to the buffer. If the buffer is full, the oldest element is overwritten.
    * @param item The element to add
    * @returns The item that was added
    */
   push(item: T): T {
      this.buffer[this.head] = item;
      this.head = (this.head + 1) % this.capacity;

      if (this._size < this.capacity) {
         this._size++;
      } else {
         // Buffer is full, move tail to discard oldest element
         this.tail = (this.tail + 1) % this.capacity;
      }

      return item;
   }

   /**
    * Removes and returns the oldest element from the buffer.
    * @returns The oldest element or undefined if the buffer is empty
    */
   pop(): T | undefined {
      if (this._size === 0) {
         return undefined;
      }

      const item = this.buffer[this.tail];
      this.buffer[this.tail] = undefined; // Help garbage collection
      this.tail = (this.tail + 1) % this.capacity;
      this._size--;

      return item;
   }

   /**
    * Returns the oldest element without removing it.
    * @returns The oldest element or undefined if the buffer is empty
    */
   peek(): T | undefined {
      if (this._size === 0) {
         return undefined;
      }
      return this.buffer[this.tail];
   }

   /**
    * Gets the element at the specified index relative to the tail (oldest element).
    * @param index The index of the element to get (0 is the oldest element)
    * @returns The element at the specified index or undefined if index is out of bounds
    */
   get(index: number): T | undefined {
      if (index < 0) {
         // Convert negative index to access from the end (newest elements)
         index = this._size + index;
      }

      if (index < 0 || index >= this._size) {
         return undefined;
      }

      return this.buffer[(this.tail + index) % this.capacity];
   }

   /**
    * Clears all elements from the buffer.
    */
   clear(): void {
      this.buffer.fill(undefined);
      this.head = 0;
      this.tail = 0;
      this._size = 0;
   }

   /**
    * Returns the current number of elements in the buffer.
    */
   get size(): number {
      return this._size;
   }

   /**
    * Returns the maximum number of elements the buffer can hold.
    */
   get maxSize(): number {
      return this.capacity;
   }

   /**
    * Checks if the buffer is empty.
    */
   get isEmpty(): boolean {
      return this._size === 0;
   }

   /**
    * Checks if the buffer is full.
    */
   get isFull(): boolean {
      return this._size === this.capacity;
   }

   /**
    * Returns an array containing all elements in the buffer, from oldest to newest.
    */
   toArray(): T[] {
      const result: T[] = [];
      for (let i = 0; i < this._size; i++) {
         const item = this.buffer[(this.tail + i) % this.capacity];
         if (item !== undefined) {
            result.push(item);
         }
      }
      return result;
   }

   /**
    * Executes a provided function once for each element in the buffer.
    * @param callback Function to execute for each element
    */
   forEach(callback: (value: T, index: number) => void): void {
      for (let i = 0; i < this._size; i++) {
         const item = this.buffer[(this.tail + i) % this.capacity];
         if (item !== undefined) {
            callback(item, i);
         }
      }
   }
}
