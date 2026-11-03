(function(){if(window.top!==window.self){document.documentElement.style.display='none';try{window.top.location.replace(window.self.location.href)}catch(e){}throw new Error('Hausrund: Anzeige in fremdem Rahmen gesperrt')}
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){})})})();
