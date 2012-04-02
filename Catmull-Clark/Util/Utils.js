

function vec_copy(r,a)
{
  r[0] = a[0];
  r[1] = a[1];
  r[2] = a[2];
}

function vec_add( r, a, b)
{
  r[0] = a[0] + b[0];
  r[1] = a[1] + b[1];
  r[2] = a[2] + b[2];
}

function vec_sub( r, a,  b)
{
  r[0] = a[0] - b[0];
  r[1] = a[1] - b[1];
  r[2] = a[2] - b[2];
}

function vec_mul( r,  f, a)
{
  r[0] = f * a[0];
  r[1] = f * a[1];
  r[2] = f * a[2];
}
function vec_mad( r,  f, a)
{
  r[0] += f * a[0];
  r[1] += f * a[1];
  r[2] += f * a[2];
}
function vec_normalize( r,  a)
{
  vec_mul(r, 1.0 / a.length, a);
}

function vec_cross( r,  a,  b)
{
  r[0] = a[1] * b[2] - a[2] * b[1];
  r[1] = a[2] * b[0] - a[0] * b[2];
  r[2] = a[0] * b[1] - a[1] * b[0];
}