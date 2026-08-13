import { Movie } from '@/types/movie';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTMDBImageUrl(path: string | null, size: 'w300' | 'w500' | 'w1280' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const MOCK_MOVIES: Movie[] = [
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQY85WAgW2qfZv43iozOfxO.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 28450,
    popularity: 92.4,
    runtime: 139,
    tagline: 'Mischief. Mayhem. Soap.',
    genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
    videos: {
      results: [{ id: '1', key: 'O-b2VfmmbyA', name: 'Official Trailer', site: 'YouTube', type: 'Trailer' }]
    },
    credits: {
      cast: [
        { id: 819, name: 'Brad Pitt', character: 'Tyler Durden', profile_path: '/cckcYc2vMseEiojFmY9WjoUtKJ1.jpg' },
        { id: 287, name: 'Edward Norton', character: 'The Narrator', profile_path: '/5XBrm12mKje20wQ6m9P2w0B9R2A.jpg' },
        { id: 1283, name: 'Helena Bonham Carter', character: 'Marla Singer', profile_path: '/mW1L2v2Q71a2M27Bv8uP05A.jpg' }
      ],
      crew: [{ id: 7467, name: 'David Fincher', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsX2f.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 34120,
    popularity: 145.8,
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }],
    videos: {
      results: [{ id: '2', key: 'zSWdZVtXT7E', name: 'Trailer 3', site: 'YouTube', type: 'Trailer' }]
    },
    credits: {
      cast: [
        { id: 10296, name: 'Matthew McConaughey', character: 'Joseph Cooper', profile_path: '/sY2v8A3423.jpg' },
        { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', profile_path: '/9234234.jpg' }
      ],
      crew: [{ id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }]
    }
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who steals information by infiltrating the targets subconscious, is offered a chance to have his criminal history erased as payment for a seemingly impossible task: "inception".',
    poster_path: '/oYuLEW9WAFUh1A29agkq9BGDyGl.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAiW5.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 35210,
    popularity: 120.3,
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }]
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMK282EOFyWawDelm0rmxCSzLqH.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    popularity: 110.5,
    runtime: 152,
    tagline: 'Welcome to a world without rules.',
    genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Action' }, { id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }]
  },
  {
    id: 299536,
    title: 'Avengers: Infinity War',
    overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
    poster_path: '/7WsyChLLEzcqIFv2VwMvy2JoaTy.jpg',
    backdrop_path: '/mDfJG3rm3mlfgVYdhvRpHTL5mab.jpg',
    release_date: '2018-04-25',
    vote_average: 8.2,
    vote_count: 28000,
    popularity: 130.2,
    runtime: 149,
    tagline: 'An entire universe. Once decision.',
    genres: [{ id: 12, name: 'Adventure' }, { id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }]
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone bare minimum survives an attempt on his life.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/rSPw7tgCH9c6NqICZefy12OpPZ0.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 19500,
    popularity: 105.0,
    runtime: 175,
    tagline: "An offer you can't refuse.",
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_path: '/39wmItEPh1JuOVccExaADejEwJ.jpg',
    backdrop_path: '/vL5LR6VdxWPjLPFRd1Pj1vI38x.jpg',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 16000,
    popularity: 98.6,
    runtime: 125,
    tagline: 'Chihiro’s adventure in a mysterious world.',
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }]
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'A burger-loving hitman, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suA2m16W22BWhx5ioz2V2oP3GjD.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    vote_count: 27000,
    popularity: 88.0,
    runtime: 154,
    tagline: 'Just because you are a character doesn\'t mean you have character.',
    genres: [{ id: 53, name: 'Thriller' }, { id: 80, name: 'Crime' }]
  }
];

export async function fetchTrendingMovies(): Promise<Movie[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  if (!apiKey && !readToken) {
    return MOCK_MOVIES;
  }

  try {
    const url = apiKey 
      ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
      : `https://api.themoviedb.org/3/trending/movie/week`;

    const res = await fetch(url, {
      headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error('Failed to fetch from TMDB');
    const data = await res.json();
    return data.results || MOCK_MOVIES;
  } catch (error) {
    console.warn('TMDB Fetch Error, using fallbacks:', error);
    return MOCK_MOVIES;
  }
}

export async function fetchCategoryMoviesPaginated(categoryOrGenreId: string | number, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  if (!apiKey && !readToken) {
    return { results: MOCK_MOVIES, total_pages: 1 };
  }

  try {
    let url = '';
    if (categoryOrGenreId === 'trending') {
      url = apiKey 
        ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`
        : `https://api.themoviedb.org/3/trending/movie/week?page=${page}`;
    } else if (categoryOrGenreId === 'popular') {
      url = apiKey 
        ? `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`
        : `https://api.themoviedb.org/3/movie/popular?page=${page}`;
    } else {
      url = apiKey 
        ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${categoryOrGenreId}&sort_by=popularity.desc&page=${page}`
        : `https://api.themoviedb.org/3/discover/movie?with_genres=${categoryOrGenreId}&sort_by=popularity.desc&page=${page}`;
    }

    const res = await fetch(url, {
      headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error('Failed to fetch category movies');
    const data = await res.json();
    return {
      results: data.results || [],
      total_pages: data.total_pages || 1
    };
  } catch (error) {
    return { results: MOCK_MOVIES, total_pages: 1 };
  }
}

export async function fetchMoviesByGenre(genreId: number): Promise<Movie[]> {
  const res = await fetchCategoryMoviesPaginated(genreId, 1);
  return res.results;
}

export async function fetchPopularMovies(): Promise<Movie[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  if (!apiKey && !readToken) {
    return MOCK_MOVIES.slice().reverse();
  }

  try {
    const url = apiKey 
      ? `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`
      : `https://api.themoviedb.org/3/movie/popular`;

    const res = await fetch(url, {
      headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error('Failed to fetch from TMDB');
    const data = await res.json();
    return data.results || MOCK_MOVIES;
  } catch (error) {
    return MOCK_MOVIES;
  }
}

export async function fetchMovieDetails(id: number): Promise<Movie | null> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  if (!apiKey && !readToken) {
    const found = MOCK_MOVIES.find((m) => m.id === id);
    return found || MOCK_MOVIES[0];
  }

  try {
    const url = apiKey 
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits`
      : `https://api.themoviedb.org/3/movie/${id}?append_to_response=videos,credits`;

    const res = await fetch(url, {
      headers: readToken ? { Authorization: `Bearer ${readToken}` } : {},
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error('Failed to fetch movie details');
    return await res.json();
  } catch (error) {
    return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
  }
}

export async function searchMoviesPaginated(query: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  if (!query.trim()) return { results: [], total_pages: 1 };

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const readToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

  if (!apiKey && !readToken) {
    const filtered = MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.overview.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, total_pages: 1 };
  }

  try {
    const url = apiKey 
      ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
      : `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=${page}`;

    const res = await fetch(url, {
      headers: readToken ? { Authorization: `Bearer ${readToken}` } : {}
    });

    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return {
      results: data.results || [],
      total_pages: data.total_pages || 1
    };
  } catch (error) {
    const filtered = MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, total_pages: 1 };
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const res = await searchMoviesPaginated(query, 1);
  return res.results;
}
