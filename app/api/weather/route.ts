import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const forecast = searchParams.get('forecast'); // 'true' to get hourly forecast

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range' },
        { status: 400 }
      );
    }

    // Fetch from OpenMeteo API
    let url: string;
    if (forecast === 'true') {
      // Get hourly forecast for 7 days (168 hours)
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days=7`;
    } else {
      // Get current temperature only
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
    }

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('OpenMeteo API request failed');
    }

    const data = await response.json();

    if (forecast === 'true') {
      // Return hourly forecast data
      if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
        throw new Error('Invalid forecast response from OpenMeteo API');
      }

      // Convert to array of { time, temperature }
      const forecastData = data.hourly.time.map((time: string, index: number) => ({
        time: new Date(time).getTime(),
        temperature: Math.round(data.hourly.temperature_2m[index] * 10) / 10, // Round to 1 decimal
      }));

      return NextResponse.json({
        latitude,
        longitude,
        forecast: forecastData,
      });
    } else {
      // Return current temperature
      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Invalid response from OpenMeteo API');
      }

      const temperature = Math.round(data.current.temperature_2m);

      return NextResponse.json({
        temperature,
        latitude,
        longitude,
        timestamp: data.current.time || new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
