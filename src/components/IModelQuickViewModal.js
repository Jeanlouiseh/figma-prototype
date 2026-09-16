import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import FitScreenOutlinedIcon from '@mui/icons-material/FitScreenOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const IModelQuickViewModal = ({
  open,
  onClose,
  modelName = 'Parkway',
  selectedSetA = [],
  selectedSetB = [],
}) => {
  const mountRef = useRef(null);
  const [activeSetFilter, setActiveSetFilter] = useState('all'); // 'all', 'A', 'B'
  const [activeTool, setActiveTool] = useState('rotate'); // 'pan', 'rotate', 'select', 'measure'
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!open || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 860;
    const height = container.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6edf2); // Matching the soft blue-gray background in screenshot

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 500);
    camera.position.set(22, 16, 26);

    const target = new THREE.Vector3(0, 1.5, 0);
    camera.lookAt(target);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(30, 45, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    // Group holding the 3D structural beam and MEP model matching the exact screenshot geometry
    const modelGroup = new THREE.Group();

    // Red beams material (Set A structural members) with dark outlines
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f, // Vivid red matching the screenshot
      roughness: 0.35,
      metalness: 0.4,
    });

    // Dark blue / navy conduit/utility pipe running across
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x0d233a, // Deep navy blue line from screenshot
      roughness: 0.25,
      metalness: 0.8,
    });

    const setAGroup = new THREE.Group();
    const setBGroup = new THREE.Group();

    // Helper to add edges to meshes for CAD-like wireframe outlines
    const createBeamWithEdges = (geo, mat) => {
      const mesh = new THREE.Mesh(geo, mat);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 1.5 })
      );
      mesh.add(line);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // 1. Long front-diagonal red beam: from bottom left towards center
    // Slanted along diagonal
    const beam1 = createBeamWithEdges(new THREE.BoxGeometry(0.85, 0.95, 12), redMat);
    beam1.position.set(-5, 0, 5);
    beam1.rotation.y = -Math.PI / 4;
    setAGroup.add(beam1);

    // 2. Middle cross-beam running rightwards
    const beam2 = createBeamWithEdges(new THREE.BoxGeometry(0.85, 0.95, 9), redMat);
    beam2.position.set(0.5, 1.2, 0);
    beam2.rotation.y = Math.PI / 4;
    setAGroup.add(beam2);

    // 3. Middle transverse beam (perpendicular)
    const beam3 = createBeamWithEdges(new THREE.BoxGeometry(11, 0.95, 0.85), redMat);
    beam3.position.set(2, 2.4, -2.5);
    beam3.rotation.y = -Math.PI / 4;
    setAGroup.add(beam3);

    // 4. Rear elevated red I-beam (supported by vertical stub column)
    const rearBeam = createBeamWithEdges(new THREE.BoxGeometry(0.95, 1.2, 7), redMat);
    rearBeam.position.set(6.5, 4.2, -6.5);
    rearBeam.rotation.y = -Math.PI / 4;
    setAGroup.add(rearBeam);

    // Vertical column post supporting rear beam
    const colPost = createBeamWithEdges(new THREE.CylinderGeometry(0.2, 0.2, 2.2, 12), redMat);
    colPost.position.set(5.5, 3.1, -5.5);
    setAGroup.add(colPost);

    // 5. Blue slender pipe / conduit connecting across the structural elements (Set B Interference)
    const pipePoints = [
      new THREE.Vector3(-1.8, 2.2, 1.2),
      new THREE.Vector3(5.5, 4.1, -5.5),
    ];
    const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.14, 12, false);
    const pipeMesh = new THREE.Mesh(pipeGeo, blueMat);
    pipeMesh.castShadow = true;
    setBGroup.add(pipeMesh);

    modelGroup.add(setAGroup);
    modelGroup.add(setBGroup);
    scene.add(modelGroup);

    // Orbit & Pan controls
    let isMouseDown = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (e.button === 0) isMouseDown = true;
      if (e.button === 2 || e.shiftKey) isPanning = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      if (isMouseDown) {
        if (isPanning || activeTool === 'pan') {
          // Pan
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
          const up = camera.up.clone().normalize();
          const panSpeed = 0.025;
          const pan = right.multiplyScalar(-deltaX * panSpeed).add(up.multiplyScalar(deltaY * panSpeed));
          camera.position.add(pan);
          target.add(pan);
        } else {
          // Rotate (Orbit)
          const offset = camera.position.clone().sub(target);
          const radius = offset.length();
          let theta = Math.atan2(offset.x, offset.z);
          let phi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));

          theta -= deltaX * 0.008;
          phi -= deltaY * 0.008;
          phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, phi));

          offset.x = radius * Math.sin(phi) * Math.sin(theta);
          offset.y = radius * Math.cos(phi);
          offset.z = radius * Math.sin(phi) * Math.cos(theta);

          camera.position.copy(target).add(offset);
          camera.lookAt(target);
        }
      }

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isMouseDown = false;
      isPanning = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.03;
      const dir = camera.position.clone().sub(target);
      const newLen = Math.max(6, Math.min(80, dir.length() + zoomDelta));
      dir.setLength(newLen);
      camera.position.copy(target).add(dir);
      camera.lookAt(target);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    controlsRef.current = {
      resetView: () => {
        target.set(0, 1.5, 0);
        camera.position.set(22, 16, 26);
        camera.lookAt(target);
      },
    };

    // Render loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Visibility based on Set filters
      setAGroup.visible = activeSetFilter === 'all' || activeSetFilter === 'A';
      setBGroup.visible = activeSetFilter === 'all' || activeSetFilter === 'B';

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [open, activeSetFilter, activeTool]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
          backgroundColor: '#fff',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
        },
      }}
    >
      {/* Popover Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #f0f2f4',
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1c1f21' }}>
          iModel quick view
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" sx={{ border: '1px solid #c2c9cd', borderRadius: 1, p: 0.5, color: '#657075' }}>
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" sx={{ border: '1px solid #c2c9cd', borderRadius: 1, p: 0.5, color: '#657075' }}>
            <LaunchIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ border: '1px solid #c2c9cd', borderRadius: 1, p: 0.5, color: '#657075' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* 3D Canvas Container */}
      <Box sx={{ position: 'relative', width: '100%', height: 560, backgroundColor: '#e6edf2' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Top-Right Pill Controls: Layers, Set A, Set B, Detach */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            p: 0.4,
            backgroundColor: '#ffffff',
            border: '1px solid #d0d7dc',
            gap: 0.5,
          }}
        >
          <Tooltip title="All elements">
            <IconButton
              size="small"
              onClick={() => setActiveSetFilter('all')}
              sx={{
                p: 0.6,
                backgroundColor: activeSetFilter === 'all' ? '#eef4f8' : 'transparent',
                color: '#495760',
              }}
            >
              <LayersOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Isolate Set A">
            <Box
              onClick={() => setActiveSetFilter(activeSetFilter === 'A' ? 'all' : 'A')}
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: activeSetFilter === 'A' ? '#1976d2' : '#576774',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              A
            </Box>
          </Tooltip>

          <Tooltip title="Isolate Set B">
            <Box
              onClick={() => setActiveSetFilter(activeSetFilter === 'B' ? 'all' : 'B')}
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: activeSetFilter === 'B' ? '#d04a02' : '#576774',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              B
            </Box>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5, borderColor: '#e0e4e7' }} />

          <Tooltip title="Pop out viewer">
            <IconButton size="small" sx={{ p: 0.6, color: '#657075' }}>
              <LaunchIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Right Vertical Tool Palette (Matching Screenshot) */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 72,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            p: 0.5,
            backgroundColor: '#ffffff',
            border: '1px solid #d0d7dc',
            gap: 0.5,
          }}
        >
          <Tooltip title="Pan tool" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('pan')}
              sx={{
                p: 0.8,
                backgroundColor: activeTool === 'pan' ? '#eef4f8' : 'transparent',
                color: activeTool === 'pan' ? '#087f6c' : '#70818d',
              }}
            >
              <PanToolOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Orbit / Rotate" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('rotate')}
              sx={{
                p: 0.8,
                backgroundColor: activeTool === 'rotate' ? '#eef4f8' : 'transparent',
                color: activeTool === 'rotate' ? '#087f6c' : '#70818d',
              }}
            >
              <RotateRightOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Fit view" placement="left">
            <IconButton
              size="small"
              onClick={() => controlsRef.current?.resetView()}
              sx={{ p: 0.8, color: '#70818d' }}
            >
              <FitScreenOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Select element" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('select')}
              sx={{
                p: 0.8,
                backgroundColor: activeTool === 'select' ? '#eef4f8' : 'transparent',
                color: activeTool === 'select' ? '#087f6c' : '#70818d',
              }}
            >
              <NearMeOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Measure distance" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('measure')}
              sx={{
                p: 0.8,
                backgroundColor: activeTool === 'measure' ? '#eef4f8' : 'transparent',
                color: activeTool === 'measure' ? '#087f6c' : '#70818d',
              }}
            >
              <StraightenOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Divider flexItem sx={{ my: 0.5, borderColor: '#e0e4e7' }} />

          <Tooltip title="Inspect details" placement="left">
            <IconButton size="small" sx={{ p: 0.8, color: '#70818d' }}>
              <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>
    </Dialog>
  );
};

export default IModelQuickViewModal;
