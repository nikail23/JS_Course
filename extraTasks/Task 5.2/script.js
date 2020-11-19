let listHTML = '';

function createList(title, list) {
    listHTML = `<ul>
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
    listHTML += `<ul style="font-size: ${bufferFont}px;"><li>${node.value}`;
    if (node.children) {
        node.children.forEach(child => {
            displayNode(child, bufferFont);
        });
    }
    listHTML += '</li></ul>';
}

const list = 
[
    {
       value: 'Пункт 1.',
       children: null,
    },
    {
       value: 'Пункт 2.',
       children: [
          {
             value: 'Подпункт 2.1.',
             children: null,
          },
          {
             value: 'Подпункт 2.2.',
             children: [
                {
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
  

console.log(listHTML);

createList('List', list);

