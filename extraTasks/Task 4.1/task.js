const ListModule = (function (){
    class Node {
        constructor (value, next) {
            this.value = value;
            this.next = next;
        }
    }
    
    class List {
        constructor (value) {
            this.root = new Node(value, null);
        }

        addNode(value, i) {
            let element = this.root;
            if (i === undefined) {
                while (element.next !== null) {
                    element = element.next;
                }
                element.next = new Node(value, null);
                return true;
            } else {
                let j = 0;
                while (j != i && element.next !== null) {
                    element = element.next;
                    j++;
                }
                if (j != i) {
                    return false;
                }
                const buffer = element.next;
                element.next = new Node(value, buffer);
                return true;
            }
        }

        removeNode(i) {
            if (this.root === null) {
                return false;
            }

            if (this.root.next === null) {
                this.root = null;
                return true;
            }

            let element = this.root;
            if (i === undefined) {
                while (element.next.next !== null) {
                    element = element.next;
                }
                element.next = null;
            } else {
                if (i === 0) {
                    this.root = this.root.next;
                    return true;
                }
                let j = 0;
                let previous;
                while (j != i && element.next !== null) {
                    if (j === i - 1) {
                        previous = element;
                    }
                    element = element.next;
                    j++;
                }
                if (j != i) {
                    return false;
                }
                previous.next = element.next;
                return true;
            }
        }

        print() {
            let resultString = "";
            let element = this.root;

            while (element !== null) {
                resultString += element.value + '';
                element = element.next;
            }

            console.log(resultString);
        }
    }

    return {
        List,
        Node,
    }
}());

let list = new ListModule.List(5);
list.addNode(6);
list.print();
list.addNode(4, 0);
list.print();
list.removeNode(0);
list.print();
list.removeNode();
list.print();
list.removeNode();
list.removeNode();
list.removeNode();
list.print();