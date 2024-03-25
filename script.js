let map, infoWindow;
let storesListContainer;

const mapStyle = [
    {
        'featureType': 'administrative',
        'elementType': 'all',
        'stylers': [
            {
                'visibility': 'on',
            },
            {
                'lightness': 33,
            },
        ],
    },
    {
        'featureType': 'landscape',
        'elementType': 'all',
        'stylers': [
            {
                'color': '#f2e5d4',
            },
        ],
    },
    {
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#c5dac6',
            },
        ],
    },
    {
        'featureType': 'poi.park',
        'elementType': 'labels',
        'stylers': [
            {
                'visibility': 'on',
            },
            {
                'lightness': 20,
            },
        ],
    },
    {
        'featureType': 'road',
        'elementType': 'all',
        'stylers': [
            {
                'lightness': 20,
            },
        ],
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#c5c6c6',
            },
        ],
    },
    {
        'featureType': 'road.arterial',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#e4d7c6',
            },
        ],
    },
    {
        'featureType': 'road.local',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#fbfaf7',
            },
        ],
    },
    {
        'featureType': 'water',
        'elementType': 'all',
        'stylers': [
            {
                'visibility': 'on',
            },
            {
                'color': '#acbcc9',
            },
        ],
    },
];

const initMap = () => {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('A API do Google Maps JavaScript não foi carregada corretamente.');
        return;
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -17.255014257811105, lng: -56.771171299857805 },
        zoom: 4,
        styles: mapStyle,
    });
    if (!map || !map.data || !(map.data instanceof google.maps.Data)) {
        console.error('O objeto map.data não foi inicializado corretamente.');
        return;
    }

    infoWindow = new google.maps.InfoWindow();
    storesListContainer = document.getElementById('stores-list');
    const service = new google.maps.places.PlacesService(map);

    const request = {
        location: map.getCenter(),
        radius: '5000',
        query: 'stores',
    };

    service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log(results)
        } else {
            console.error('Erro ao buscar lojas:', status);
        }
    });

    map.data.setStyle((feature) => {
        return {
            icon: {
                url: `img/icon_${feature.getProperty('category')}.png`,
                scaledSize: new google.maps.Size(64, 64),
            },
        };
    });

    const locationButton = document.createElement('button');
    locationButton.textContent = 'Localização atual';
    locationButton.classList.add('custom-map-control-button');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent('Location found.');
                    infoWindow.open(map);
                    map.setCenter(pos);
                    map.setZoom(15);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            console.log('Navegador não suporta');
        }
    });

    const card = document.createElement('div');
    const titleBar = document.createElement('div');
    const title = document.createElement('div');
    const container = document.createElement('div');
    const input = document.createElement('input');
    const options = {
        types: ['geocode', 'establishment'],
    };

    // Adicionando classes aos elementos
    container.classList.add('pac-container');
    input.classList.add('pac-input');
    locationButton.classList.add('custom-map-control-button');

    // Configurando atributos dos elementos
    input.setAttribute('id', 'pac-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Digite um endereço');

    // Adicionando elementos ao DOM
    container.appendChild(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(container);

    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.setFields(['address_components', 'geometry', 'name']);
    const originMarker = new google.maps.Marker({ map: map });
    originMarker.setVisible(false);
    let originLocation = map.getCenter();

    autocomplete.addListener('place_changed', async () => {
        originMarker.setVisible(false);
        originLocation = map.getCenter();
        const place = autocomplete.getPlace();

        if (!place.geometry) {
            window.alert('No address available for input: \'' + place.name + '\'');
            return;
        }

        originLocation = place.geometry.location;
        map.setCenter(originLocation);
        map.setZoom(20);

        originMarker.setPosition(originLocation);
        originMarker.setVisible(true);

        if (!map || !map.data || !(map.data instanceof google.maps.Data)) {
            console.error('O objeto map.data não foi inicializado corretamente.');
            return;
        }

        const features = map.data.getFeatures();

        if (!Array.isArray(features) || features.length === 0) {
            console.error('Empty or invalid features array');
            return;
        }

        const request = {
            location: originLocation,
            radius: '1000',
            query: 'stores',
        };

        service.textSearch(request, async (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // const distancesList = await calculateDistances(features, originLocation);
                // showStoresList(results, features, distancesList);
            } else {
                console.error('Erro ao buscar lojas:', status);
            }
        });
    });
};

window.initMap = initMap;
