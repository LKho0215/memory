import { Object3DNode } from '@react-three/fiber'
import { Color, Mesh, AmbientLight, PointLight, SphereGeometry, MeshStandardMaterial, Group, IcosahedronGeometry, MeshPhysicalMaterial, BufferGeometry, BufferAttribute, ShaderMaterial, BoxGeometry } from 'three'

declare module '@react-three/fiber' {
    interface ThreeElements {
        color: Object3DNode<Color, typeof Color>
        mesh: Object3DNode<Mesh, typeof Mesh>
        ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>
        pointLight: Object3DNode<PointLight, typeof PointLight>
        sphereGeometry: Object3DNode<SphereGeometry, typeof SphereGeometry>
        meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>
        group: Object3DNode<Group, typeof Group>
        icosahedronGeometry: Object3DNode<IcosahedronGeometry, typeof IcosahedronGeometry>
        meshPhysicalMaterial: Object3DNode<MeshPhysicalMaterial, typeof MeshPhysicalMaterial>
        bufferGeometry: Object3DNode<BufferGeometry, typeof BufferGeometry>
        bufferAttribute: Object3DNode<BufferAttribute, typeof BufferAttribute>
        shaderMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>
        boxGeometry: Object3DNode<BoxGeometry, typeof BoxGeometry>
    }
}
