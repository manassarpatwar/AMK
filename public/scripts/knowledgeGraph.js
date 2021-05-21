
/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('typeSet').innerHTML= 'of type: '+type;
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
        document.getElementById('adjustType').style.display='block';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * hides the search box and reveals the set type box
 */
function adjustType(){
    document.getElementById("myType").value = "";
    document.getElementById("myInput").value = ""
    document.getElementById('widget').style.display='none';
    document.getElementById('typeSet').innerHTML= '';
    document.getElementById('typeForm').style.display= 'block';
    document.getElementById('adjustType').style.display='none';
}

/**
 * callback called when an element in the widget is selected
 * appends new result to the result div in the chat page
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row = event.row;
    let results = document.getElementById('resultPanel');
    let result = document.createElement('div');
    result.className = "knowledgeGraphResult"

    let name = document.createElement('h4');
    name.innerText = row.name;
    name.style.textAlign = "center";
    result.appendChild(name);

    let description = document.createElement('p');
    description.innerText = row.rc;
    description.style.textAlign = "justify";
    result.appendChild(description);

    let link = document.createElement("a");
    link.innerText = "See more..."
    link.href = row.qc;
    result.appendChild(link);

    results.appendChild(result);
}