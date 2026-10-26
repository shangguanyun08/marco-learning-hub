(function(root){
 'use strict';
 root.MarcoQR4OriginalData=root.MarcoQR4Data;
 if(new URLSearchParams(root.location.search).get('session')==='2')root.MarcoQR4Data=root.MarcoQR4Practice2Data;
 const tracker=root.document.querySelector('script[data-app-id="marco-qr-oct23-test4-v1"]');
 if(tracker){tracker.dataset.appId=root.MarcoQR4Data.appId;if(root.MarcoQR4Data.practiceNumber===2)tracker.dataset.course='10/23/2026 QR Practice Test 4 · Practice 2';}
})(window);
