import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef(null);

  // if using a class, equivalent of componentDidMount 
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/PDFTRON_about.pdf',
      },
      // document.getElementById('viewer')).then(instance => {
      //   const style = instance.UI.iframeWindow.document.documentElement.style;
      //   style.setProperty(`--primary-button`, 'red');
      //   style.setProperty(`--primary-button-hover`, 'yellow');
      // })
      viewer.current,
    
    ).then(async(instance) => {
      const { documentViewer, annotationManager, Annotations, PDFNet } = instance.Core;
      
      await PDFNet.initialize();

      instance.UI.enableElements(['bookmarksPanel', 'bookmarksPanelButton']);

      instance.UI.setHeaderItems(header => {
        header.push({
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
          onClick: async() => {
            // save the annotations
            console.log(await annotationManager.exportAnnotations({links: false,widgets: false}))
          }
        });
      });

      // annotationManager.on('annotationChanged', async () => {
      //  console.log(await annotationManager.getGroupAnnotations())
      // });

      documentViewer.on('documentLoaded', async() => {
        const doc = documentViewer.getDocument();
        const pdfDoc = await doc.getPDFDoc();
    
        // create bookmark and add it to the first page
        const myitem = await PDFNet.Bookmark.create(pdfDoc, 'My bookmark');
        await myitem.setAction(await PDFNet.Action.createGoto(await PDFNet.Destination.createFit(await pdfDoc.getPage(1))));
        await pdfDoc.addRootBookmark(myitem);
    
        // refresh document outline
        const bookmarks = await doc.getBookmarks();
        instance.UI.updateOutlines(bookmarks);
      });
    
    

      documentViewer.on('documentLoaded', async () => {
        annotationManager.setCurrentUser('Mehul');
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });

        annotationManager.addAnnotation(rectangleAnnot);
        // need to draw the annotation otherwise it won't show up until the page is refreshed
        annotationManager.redrawAnnotation(rectangleAnnot);

      
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
