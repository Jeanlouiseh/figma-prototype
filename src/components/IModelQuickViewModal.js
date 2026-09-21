import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Dialog,
  Box,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import FitScreenOutlinedIcon from '@mui/icons-material/FitScreenOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getModelForIModel } from '../utils/pittsburghModels';

const IModelQuickViewModal = ({
  open,
  onClose,
  modelName = 'Roberto Clemente Bridge',
  selectedSetA = [],
  selectedSetB = [],
}) => {
  const mountRef = useRef(null);
  const [activeSetFilter, setActiveSetFilter] = useState('all'); // 'all', 'A', 'B'
  const [activeTool, setActiveTool] = useState('rotate'); // 'pan', 'rotate', 'select', 'measure'
  const [viewerReadyKey, setViewerReadyKey] = useState(0);
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

    const bridge = getModelForIModel(modelName, THREE, { showWater: true });
    const modelGroup = bridge.modelGroup;
    const setAGroup = bridge.setAGroup;
    const setBGroup = bridge.setBGroup;
    scene.add(modelGroup);

    camera.position.copy(bridge.defaultCameraPos);
    target.copy(bridge.defaultTarget);
    camera.lookAt(target);

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
        target.copy(bridge.defaultTarget);
        camera.position.copy(bridge.defaultCameraPos);
        camera.lookAt(target);
      },
      zoomIn: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.max(6, dir.length() - 5));
        camera.position.copy(target).add(dir);
        camera.lookAt(target);
      },
      zoomOut: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.min(80, dir.length() + 5));
        camera.position.copy(target).add(dir);
        camera.lookAt(target);
      },
      setCameraView: () => {
        target.copy(bridge.defaultTarget);
        camera.position.copy(bridge.defaultCameraPos);
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
  }, [open, modelName, activeSetFilter, activeTool, viewerReadyKey]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      TransitionProps={{
        onEntered: () => setViewerReadyKey((key) => key + 1),
      }}
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
      <Box sx={{ position: 'relative', width: '100%', height: 560, backgroundColor: '#e6edf2', minWidth: 0 }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            p: 0.5,
            backgroundColor: '#ffffff',
            border: '1px solid #d0d7dc',
            boxShadow: '0 8px 22px rgba(0,0,0,0.10)',
            gap: 0.5,
            zIndex: 2,
          }}
        >
          <Tooltip title="Pop out viewer" placement="left">
            <IconButton size="small" onClick={onClose} sx={{ p: 0.7, color: '#656f78' }}>
              <LaunchIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Pan tool" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('pan')}
              sx={{
                p: 0.7,
                backgroundColor: activeTool === 'pan' ? '#edf4f8' : 'transparent',
                color: activeTool === 'pan' ? '#087f6c' : '#5f6d76',
              }}
            >
              <PanToolOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Fit view" placement="left">
            <IconButton
              size="small"
              onClick={() => controlsRef.current?.resetView()}
              sx={{ p: 0.7, color: '#5f6d76' }}
            >
              <FitScreenOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Orbit / Rotate" placement="left">
            <IconButton
              size="small"
              onClick={() => setActiveTool('rotate')}
              sx={{
                p: 0.7,
                backgroundColor: activeTool === 'rotate' ? '#edf4f8' : 'transparent',
                color: activeTool === 'rotate' ? '#087f6c' : '#5f6d76',
              }}
            >
              <RotateRightOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom in" placement="left">
            <IconButton size="small" onClick={() => controlsRef.current?.zoomIn()} sx={{ p: 0.7, color: '#5f6d76' }}>
              <ZoomInOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom out" placement="left">
            <IconButton size="small" onClick={() => controlsRef.current?.zoomOut()} sx={{ p: 0.7, color: '#5f6d76' }}>
              <ZoomOutOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Camera view" placement="left">
            <IconButton
              size="small"
              onClick={() => {
                setActiveTool('camera');
                controlsRef.current?.setCameraView();
              }}
              sx={{
                p: 0.7,
                backgroundColor: activeTool === 'camera' ? '#edf4f8' : 'transparent',
                color: activeTool === 'camera' ? '#087f6c' : '#5f6d76',
              }}
            >
              <CameraAltOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Search elements" placement="left">
            <IconButton size="small" sx={{ p: 0.7, color: '#5f6d76' }}>
              <SearchOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hide/show elements" placement="left">
            <IconButton size="small" sx={{ p: 0.7, color: '#5f6d76' }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Paper>

        <Box
          sx={{
            position: 'absolute',
            right: 18,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.7,
            zIndex: 2,
          }}
        >
          <Tooltip title="Isolate Set A">
            <Box
              onClick={() => setActiveSetFilter(activeSetFilter === 'A' ? 'all' : 'A')}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                backgroundColor: activeSetFilter === 'A' ? '#1976d2' : '#dfeaf3',
                color: activeSetFilter === 'A' ? '#fff' : '#2d6ee8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
                border: '1px solid rgba(51,79,97,0.12)',
              }}
            >
              A
            </Box>
          </Tooltip>

          <Tooltip title="Isolate Set B">
            <Box
              onClick={() => setActiveSetFilter(activeSetFilter === 'B' ? 'all' : 'B')}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                backgroundColor: activeSetFilter === 'B' ? '#d04a02' : '#dfeaf3',
                color: activeSetFilter === 'B' ? '#fff' : '#d04a02',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.10)',
                border: '1px solid rgba(51,79,97,0.12)',
              }}
            >
              B
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Dialog>
  );
};

export default IModelQuickViewModal;
