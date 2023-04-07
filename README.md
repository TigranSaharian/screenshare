# What is this?

many to many video streaming

# Instolation

`npm i react.screenshare --save`

# inital

```
import { Screenshare } from "react.screenshare";
```

## *React*
```
<Screenshare 
    roomId='roomid_123'
    videoContainer= {document.getElementById("container")}
    videoControls={['full-screen'] } 
/>
```

* *Screenshare component* 
```
const connection = new Screenshare({
    roomId, videoContainer, videoControls
});


create any button and take the id

useEffect(()=>{
    connection.openRoom()
},[connection])
```
## *JavaScript*
```
var connectin = new Screenshare({
    roomId: 'roomid_123',
    videoContainer: document.getElementById('container'),
    videoControls: [
        'full-screen'
    ]
});

connectin.open();
```

## Options

* *roomId* - any unique id (typeof string)
* *videoContainer* - take the HTML element | document.getElementById('elementId')
* *videoControls* - 'mute-audio','mute-video','full-screen',
                    'take-snapshot','record-audio','record-video',
                    'volume-slider','stop'