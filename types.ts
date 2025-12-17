
export enum VehicleStatus {
  EXPECTED = 'EXPECTED',
  IN = 'IN',
  OUT = 'OUT'
}

export interface Vehicle {
  id: string;
  ownerName: string; // NOME
  plate: string;     // PLACA DO CARRO
  location: string;  // LOTAÇÃO
  coordination: string; // COORDENADORIA
  phone: string;     // TELEFONE
  group: string;     // GRUPO
  status: VehicleStatus;
  lastActionTime?: number;
}

export interface AccessLog {
  id: string;
  vehicleId: string;
  plate: string;
  ownerName: string;
  action: 'ENTRY' | 'EXIT';
  timestamp: number;
}
