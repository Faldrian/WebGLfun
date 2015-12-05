var particles = {
  pointsToParticle: function (points) {
    var vertices = [];
    var texcoords = []; // 0=x, 1=y, 2=particleindex
    var particleSize = 0.1;

    points.forEach(function(point) {
      var x = point[0],
          y = point[1],
          z = point[2];

      // create vertices
      var vseg1a = vec3.fromValues(x-particleSize/2, y-particleSize/2, z),
          vseg2a = vec3.fromValues(x+particleSize/2, y-particleSize/2, z),
          vseg1b = vec3.fromValues(x-particleSize/2, y+particleSize/2, z),
          vseg2b = vec3.fromValues(x+particleSize/2, y+particleSize/2, z);

      // add triangles to list
      particles.pushVec3Triplet(vertices, vseg1a, vseg2a, vseg1b);
      particles.pushVec3Triplet(vertices, vseg1b, vseg2a, vseg2b);

      // texture coordinates
      var tex1a = vec2.fromValues(0, 0),
          tex2a = vec2.fromValues(1, 0),
          tex1b = vec2.fromValues(0, 1),
          tex2b = vec2.fromValues(1, 1);

      // add texture coodinates to list
      particles.pushVec2Triplet(texcoords, tex1a, tex2a, tex1b);
      particles.pushVec2Triplet(texcoords, tex1b, tex2a, tex2b);
    });

    return [vertices, texcoords];
  },

  pointCube: function(pointsPerSide, width, origin) {
    var points = [];

    // sides like this:
    //
    // 41111
    // 4   2
    // 4   2
    // 4   2
    // 33332

    // make sides
    var radius = width*0.5;
    for(var i=1; i<pointsPerSide; i++) { //
      var progressOnSide = i/(pointsPerSide-1);

      for(var z=0; z<pointsPerSide; z++) {
        var zLevel = origin[2]+(z/pointsPerSide-0.5)*width;

        // draw all 4 sides in one go
        points.push(vec3.fromValues( // top side
          (origin[0]+(progressOnSide-0.5)*width),
          (origin[1]-radius),
          zLevel
        ));

        points.push(vec3.fromValues( // right side
          (origin[0]+radius),
          (origin[1]+(progressOnSide-0.5)*width),
          zLevel
        ));

        points.push(vec3.fromValues( // bottom side
          (origin[0]+(0.5-progressOnSide)*width),
          (origin[1]+radius),
          zLevel
        ));

        points.push(vec3.fromValues( // left side
          (origin[0]-radius),
          (origin[1]+(0.5-progressOnSide)*width),
          zLevel
        ));

      }
    }

    return points;
  },

  pointSphere: function(totalPoints, numTurns, width, origin) {
    var points = [];

    // all points are distributed along a spiral to make the sphere

    for(var i=0; i<totalPoints; i++) {
      // get the "roundness" for z/rotatin-axis
      var zProgress = (i/totalPoints-1) * Math.PI;
      var radius = Math.sin(zProgress) * width * 0.5;
      var z = Math.cos(zProgress) * width * 0.5;

      var iProgress = (i/totalPoints-1) * numTurns * 2 * Math.PI;
      var x = Math.cos(iProgress) * radius;
      var y = Math.sin(iProgress) * radius;

      points.push(vec3.fromValues(x, y, z));
    }

    return points;
  },

/**
 * push 3 vec3 on a linear array for use with webGL
 * @param {array} out
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} c
 */
  pushVec3Triplet: function(out, a, b, c) {
    out.push(a[0], a[1], a[2],
             b[0], b[1], b[2],
             c[0], c[1], c[2]);
  },

/**
 * push 3 vec2 on a linear array for use with webGL
 * @param {array} out
 * @param {vec2} a
 * @param {vec2} b
 * @param {vec2} c
 */
  pushVec2Triplet: function(out, a, b, c) {
    out.push(a[0], a[1],
             b[0], b[1],
             c[0], c[1]);
  },
};
