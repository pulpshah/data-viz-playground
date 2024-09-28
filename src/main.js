// main.js

// Import libraries
import * as d3 from 'd3';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Import data files
import data_viz1 from './data_viz1.json';
import data_viz2 from './data_viz2.json';
import data_viz3 from './data_viz3.json';

// Visualization metadata
const visualizations = [
  // D3.js Visualizations
  {
    id: 'd3_viz1',
    library: 'd3',
    title: 'Population Growth',
    graphType: 'Animated Line Chart',
    dimensions: 2,
    axesLabels: { x: 'Year', y: 'Population' },
    animation: true,
    dataSource: 'Sample Data',
    initFunction: createD3Visualization1,
    destroyFunction: null,
    dataFile: data_viz1,
    codeFunction: createD3Visualization1,
    backgroundColor: '#fff', // Background color for this visualization
  },
  {
    id: 'd3_viz2',
    library: 'd3',
    title: 'Sales Over Time',
    graphType: 'Bar Chart',
    dimensions: 2,
    axesLabels: { x: 'Month', y: 'Sales' },
    animation: false,
    dataSource: 'Sample Data',
    initFunction: createD3Visualization2,
    destroyFunction: null,
    dataFile: data_viz2,
    codeFunction: createD3Visualization2,
    backgroundColor: '#fff',
  },
  // Three.js Visualizations
  {
    id: 'three_viz1',
    library: 'three',
    title: 'Rotating Torus Knot',
    graphType: '3D Animation',
    dimensions: 3,
    axesLabels: { x: 'X-Axis', y: 'Y-Axis', z: 'Z-Axis' },
    animation: true,
    dataSource: 'None',
    initFunction: createThreeVisualization1,
    destroyFunction: destroyThreeVisualization,
    dataFile: null, // No data needed
    codeFunction: createThreeVisualization1,
    backgroundColor: '#000',
  },
  {
    id: 'three_viz2',
    library: 'three',
    title: '3D Scatter Plot',
    graphType: 'Scatter Plot',
    dimensions: 3,
    axesLabels: { x: 'Longitude', y: 'Latitude', z: 'Depth' },
    animation: false,
    dataSource: 'Sample Data',
    initFunction: createThreeVisualization2,
    destroyFunction: destroyThreeVisualization,
    dataFile: data_viz3,
    codeFunction: createThreeVisualization2,
    backgroundColor: '#000',
  },
];

// Store active visualization
let activeVisualization = null;

// Store initialized visualizations
const initializedVisualizations = {};

document.addEventListener('DOMContentLoaded', () => {
  generateMenu();
  setupEventListeners();

  // Initialize with the first visualization
  showVisualization(visualizations[0].id);
});

// Function to generate the menu dynamically
function generateMenu() {
  const menuList = document.getElementById('menu-list');
  const libraries = ['d3', 'three'];

  libraries.forEach(library => {
    const libraryItem = document.createElement('li');
    libraryItem.textContent = library === 'd3' ? 'D3.js' : 'Three.js';

    const submenu = document.createElement('ul');
    submenu.classList.add('submenu');

    visualizations
      .filter(viz => viz.library === library)
      .forEach(viz => {
        const vizItem = document.createElement('li');
        vizItem.textContent = viz.title;
        vizItem.setAttribute('data-viz-id', viz.id);

        // Event listener for hover to update caption and header
        vizItem.addEventListener('mouseenter', () => {
          updateCaption(viz);
          updateHeader(viz);
        });

        // Event listener for click to load visualization
        vizItem.addEventListener('click', () => {
          showVisualization(viz.id);
          // Hide the menu after selection
          document.getElementById('visualization-menu').style.display = 'none';
        });

        submenu.appendChild(vizItem);
      });

    libraryItem.appendChild(submenu);
    menuList.appendChild(libraryItem);
  });
}

// Function to update the caption area
function updateCaption(viz) {
  const col1 = document.getElementById('caption-col1');
  const col2 = document.getElementById('caption-col2');

  col1.innerHTML = `
    <strong>Graph Type:</strong> ${viz.graphType}<br>
    <strong>Dimensions:</strong> ${viz.dimensions}
  `;

  const axesLabels = Object.entries(viz.axesLabels)
    .map(([axis, label]) => `${axis.toUpperCase()}: ${label}`)
    .join('<br>');

  col2.innerHTML = `<strong>Axes Labels:</strong><br>${axesLabels}`;
}

// Function to update the header
function updateHeader(viz) {
  document.getElementById('graph-title').textContent = viz.title;
  document.getElementById('data-source').textContent = `Data Source: ${viz.dataSource}`;
}

// Function to show the selected visualization
function showVisualization(vizId) {
  // Remove previous visualization
  if (activeVisualization) {
    const container = document.getElementById(activeVisualization.id);
    if (container) {
      container.remove();
    }
    if (initializedVisualizations[activeVisualization.id]?.destroyFunction) {
      initializedVisualizations[activeVisualization.id].destroyFunction();
    }
  }

  const viz = visualizations.find(v => v.id === vizId);
  if (!viz) return;

  activeVisualization = viz;

  // Update the header title and data source
  updateHeader(viz);

  // Set background color
  document.getElementById('visualization-container').style.backgroundColor = viz.backgroundColor;

  // Create container for the visualization
  const vizContainer = document.createElement('div');
  vizContainer.id = viz.id;
  vizContainer.classList.add('visualization', 'active');

  document.getElementById('visualization-container').appendChild(vizContainer);

  // Call the initialization function
  if (!initializedVisualizations[viz.id]) {
    viz.initFunction(vizContainer, viz.dataFile);
    initializedVisualizations[viz.id] = {
      initFunction: viz.initFunction,
      destroyFunction: viz.destroyFunction || null
    };
  } else {
    viz.initFunction(vizContainer, viz.dataFile);
  }

  // Update the caption
  updateCaption(viz);
}

// Event listener setup
function setupEventListeners() {
  // Event listener for the Floating Action Button
  document.getElementById('fab').addEventListener('click', () => {
    const menu = document.getElementById('visualization-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  // Event listener for the Code Button
  document.getElementById('code-button').addEventListener('click', () => {
    const codeMenu = document.getElementById('code-menu');
    codeMenu.style.display = codeMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Event listeners for Code Menu options
  document.getElementById('see-code').addEventListener('click', () => {
    displayContent('code');
    document.getElementById('code-menu').style.display = 'none';
  });

  document.getElementById('see-data').addEventListener('click', () => {
    displayContent('data');
    document.getElementById('code-menu').style.display = 'none';
  });

  // Close button for modal
  document.getElementById('close-button').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
  });

  // Copy button for modal
  document.getElementById('copy-button').addEventListener('click', () => {
    copyToClipboard();
  });

  // Event listeners for header and caption hover and click
  const header = document.getElementById('header');
  const caption = document.getElementById('caption');

  header.addEventListener('mouseenter', () => {
    header.classList.toggle('hovered', true);
  });
  header.addEventListener('mouseleave', () => {
    header.classList.toggle('hovered', false);
  });
  header.addEventListener('click', () => {
    header.classList.toggle('active');
  });

  caption.addEventListener('mouseenter', () => {
    caption.classList.toggle('hovered', true);
  });
  caption.addEventListener('mouseleave', () => {
    caption.classList.toggle('hovered', false);
  });
  caption.addEventListener('click', () => {
    caption.classList.toggle('active');
  });
}

// Function to display code or data
function displayContent(type) {
  const modalOverlay = document.getElementById('modal-overlay');
  const displayContent = document.getElementById('display-content');

  let content = '';
  if (type === 'code') {
    const codeString = activeVisualization.codeFunction.toString();
    content = `/*\nTitle: ${activeVisualization.title}\nDescription: ${activeVisualization.graphType}\n*/\n\n${codeString}`;
  } else if (type === 'data') {
    const dataString = JSON.stringify(activeVisualization.dataFile, null, 2);
    content = `/*\nTitle: ${activeVisualization.title}\nData Source: ${activeVisualization.dataSource}\n*/\n\n${dataString}`;
  }

  displayContent.textContent = content;
  modalOverlay.style.display = 'block';
}

// Function to copy content to clipboard
function copyToClipboard() {
  const displayContent = document.getElementById('display-content');
  navigator.clipboard.writeText(displayContent.textContent).then(() => {
    alert('Content copied to clipboard!');
  });
}

// D3.js Visualization 1: Animated Line Chart
function createD3Visualization1(container, data) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  // Use the data passed in
  const parsedData = data;

  const xScale = d3.scaleLinear()
    .domain(d3.extent(parsedData, d => d.year))
    .range([50, width - 20]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(parsedData, d => d.population) + 50])
    .range([height - 50, 20]);

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.population));

  svg.append('g')
    .attr('transform', `translate(0, ${height - 50})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

  svg.append('g')
    .attr('transform', `translate(50, 0)`)
    .call(d3.axisLeft(yScale));

  const path = svg.append('path')
    .datum(parsedData.slice(0, 1))
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 5);

  let index = 1;
  function animate() {
    if (index > parsedData.length) return;

    path.datum(parsedData.slice(0, index))
      .attr('d', line);

    index++;
    requestAnimationFrame(animate);
  }
  animate();
}

// D3.js Visualization 2: Bar Chart
function createD3Visualization2(container, data) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  // Use the data passed in
  const parsedData = data;

  const xScale = d3.scaleBand()
    .domain(parsedData.map(d => d.month))
    .range([50, width - 20])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(parsedData, d => d.sales)])
    .range([height - 50, 20]);

  svg.append('g')
    .attr('transform', `translate(0, ${height - 50})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(50, 0)`)
    .call(d3.axisLeft(yScale));

  svg.selectAll('.bar')
    .data(parsedData)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.month))
    .attr('y', d => yScale(d.sales))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - 50 - yScale(d.sales))
    .attr('fill', 'steelblue');
}

// Three.js Visualization 1: Rotating Torus Knot
let threeAnimationId;
function createThreeVisualization1(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 20;

  const controls = new OrbitControls(camera, renderer.domElement);

  const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
  const material = new THREE.MeshNormalMaterial();
  const torusKnot = new THREE.Mesh(geometry, material);
  scene.add(torusKnot);

  function animate() {
    torusKnot.rotation.x += 0.01;
    torusKnot.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);

    threeAnimationId = requestAnimationFrame(animate);
  }
  animate();

  function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  // Store the destroy function to clean up
  initializedVisualizations[activeVisualization.id].destroyFunction = () => {
    cancelAnimationFrame(threeAnimationId);
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
    controls.dispose();
  };
}

// Three.js Visualization 2: 3D Scatter Plot
function createThreeVisualization2(container, data) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(50, 50, 50);

  const controls = new OrbitControls(camera, renderer.domElement);

  // Use the data passed in
    // Sample data: random points
    const points = [];
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;
      points.push(new THREE.Vector3(x, y, z));
    }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.PointsMaterial({ color: 0x0080ff, size: 0.5 });
  const pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    threeAnimationId = requestAnimationFrame(render);
  }
  render();

  function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  // Store the destroy function to clean up
  initializedVisualizations[activeVisualization.id].destroyFunction = () => {
    cancelAnimationFrame(threeAnimationId);
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
    controls.dispose();
  };
}

// Destroy function for Three.js visualizations
function destroyThreeVisualization() {
  if (threeAnimationId) {
    cancelAnimationFrame(threeAnimationId);
  }
}