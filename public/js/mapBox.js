/* eslint-disable*/
// trick de lay data tu server la gan data vao dataset trong html, sau do dung dom de lay ra
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidnV0cm5na2llbiIsImEiOiJjbDFod3Fuc2swbnRmM2RxdXBtNXlvMXJpIn0.YTx8m4DC0E0j4HAQ9j307A';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vutrngkien/cl1hxvuhz002w14q4ngskuu8x',
    scrollZoom: false,
    // center: [-118.11, 34.11],
    // zoom: 9,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      anchor: 'bottom',
      element: el,
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 40,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
