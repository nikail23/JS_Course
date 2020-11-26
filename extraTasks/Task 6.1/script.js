let listHTML = '';

function createList(title, list) {
   listHTML = `<ul id="list">
    <h2>${title}</h2>`;
   list.forEach(node => {
      displayNode(node, 20);
   });
   listHTML += '</ul>';
   const container = document.getElementsByTagName('body')[0];
   container.innerHTML = listHTML;
}

function displayNode(node, font) {
   const bufferFont = font * 0.9;
   listHTML += `<ul style="font-size: ${bufferFont}px;"><li><span>${node.value}</span>`;
   if (node.children) {
      node.children.forEach(child => {
         displayNode(child, bufferFont);
      });
   }
   listHTML += '</li></ul>';
}

const list = [{
      value: 'Пункт 1.',
      children: null,
   },
   {
      value: 'Пункт 2.',
      children: [{
            value: 'Подпункт 2.1.',
            children: null,
         },
         {
            value: 'Подпункт 2.2.',
            children: [{
                  value: 'Подпункт 2.2.1.',
                  children: null,
               },
               {
                  value: 'Подпункт 2.2.2.',
                  children: null,
               }
            ],
         },
         {
            value: 'Подпункт 2.3.',
            children: null,
         }
      ]
   },
   {
      value: 'Пункт 3.',
      children: null,
   }
];

function addListEvent(node) {
   Array.prototype.slice.call(node.children).forEach(child => {
      if (child.localName === 'li' && child.children !== null) {
         const textBlock = child.children[0];
         textBlock.addEventListener('click', ()=> {
            let siblingsUl = Array.prototype.slice.call(textBlock.parentNode.children);
            siblingsUl = siblingsUl.splice(1, siblingsUl.length - 1);
            siblingsUl.forEach(ul => {
               if (ul.classList.contains('hiddenListNode')) {
                  ul.classList.remove('hiddenListNode');
                  ul.classList.add('listNode');
               } else {
                  ul.classList.remove('listNode');
                  ul.classList.add('hiddenListNode');
               }
            });
         });
      }
      addListEvent(child);
   });
}


createList('List', list);
addListEvent(document.getElementById('list'));