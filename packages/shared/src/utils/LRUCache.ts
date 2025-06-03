class Node<K, V> {
   key: K;
   value: V;
   prev: Node<K, V> | null;
   next: Node<K, V> | null;

   constructor(key: K, value: V) {
      this.key = key;
      this.value = value;
      this.prev = null;
      this.next = null;
   }
}

export class LRUCache<K, V> {
   private cache: Map<K, Node<K, V>>;
   private maxCapacity: number;
   private head: Node<K, V> | null;
   private tail: Node<K, V> | null;

   constructor(maxCapacity: number) {
      this.cache = new Map();
      this.maxCapacity = maxCapacity;
      this.head = null;
      this.tail = null;
   }

   private moveToFront(node: Node<K, V>): void {
      if (node === this.head) return;

      // Remove node from its current position
      if (node.prev) node.prev.next = node.next;
      if (node.next) node.next.prev = node.prev;
      if (node === this.tail) this.tail = node.prev;

      // Move to front
      node.next = this.head;
      node.prev = null;
      if (this.head) this.head.prev = node;
      this.head = node;
      if (!this.tail) this.tail = node;
   }

   get(key: K): V | undefined {
      const node = this.cache.get(key);
      if (!node) return undefined;

      this.moveToFront(node);
      return node.value;
   }

   set(key: K, value: V): void {
      if (this.cache.has(key)) {
         const node = this.cache.get(key)!;
         node.value = value;
         this.moveToFront(node);
         return;
      }

      if (this.cache.size >= this.maxCapacity) {
         // Remove least recently used (tail)
         if (this.tail) {
            this.cache.delete(this.tail.key);
            this.tail = this.tail.prev;
            if (this.tail) this.tail.next = null;
            else this.head = null;
         }
      }

      // Add new node to front
      const newNode = new Node(key, value);
      newNode.next = this.head;
      if (this.head) this.head.prev = newNode;
      this.head = newNode;
      if (!this.tail) this.tail = newNode;
      this.cache.set(key, newNode);
   }

   delete(key: K): boolean {
      const node = this.cache.get(key);
      if (!node) return false;

      if (node.prev) node.prev.next = node.next;
      if (node.next) node.next.prev = node.prev;
      if (node === this.head) this.head = node.next;
      if (node === this.tail) this.tail = node.prev;

      return this.cache.delete(key);
   }

   clear(): void {
      this.cache.clear();
      this.head = null;
      this.tail = null;
   }

   size(): number {
      return this.cache.size;
   }

   has(key: K): boolean {
      return this.cache.has(key);
   }
}
