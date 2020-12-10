//prefixes for implementation want to test

//declare db and request to open db

 //onupgradeneeded (schema)
 //On install, create bulk (pending) collection and save to indexDB

//activate (onsuccess)
    //check if app online before reading from db
    //checkDatabase (if online)

//on error

 //saveRecord (save to index db incase install fails)
 function saveRecord(data) {
    console.log(data);
       
}

//checkDatabase, ref db + store
    //getAll onsuccess
    //if something in bulk, going to post it (bc back online)

    //.then (turn response into json)
    //.then delete records if successful

//listen to when back online and save records