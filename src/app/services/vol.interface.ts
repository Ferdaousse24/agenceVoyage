export interface Vol {
    departure: {
      iataCode: string;
      terminal?: string;
      at: string;
    };
    arrival: {
      iataCode: string;
      terminal?: string;
      at: string;
    };
    carrierCode: string;
    number: string;
    aircraft: string;
    duration: string;
    numberOfStops: number;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    travelers: Array<{
      travelerType: string;
      price: {
        currency: string;
        total: string;
        base: string;
      };
      cabin: string;
      fareBasis: string;
      brandedFare: string;
      class: string;
    }>;
  }
  
  export interface Vols {
    volsAlle: Vol[];
    volsRetour: Vol[];
  }
  
