/*! trigrid.pde
 * 
 * @author: Travis Fischer
 * @date:   8/2/2013
 */

// size of triangle edges
static float TRIANGLE_SIZE = /** float [ 1.0, 100.0 ] **/ 50.0 /** endfloat **/;

// determines whether or not initial grid will be populated with randomly-colored
// triangles or left blank.
static boolean RANDOMIZE   = /** boolean **/ false /** endboolean **/;

static color[] COLOR_SCHEME = {
    /** color **/ #D3EAF2 /** endcolor **/, // color1
    /** color **/ #F8AA9A /** endcolor **/, // color2
    /** color **/ #FED03F /** endcolor **/  // color3
};

Triangle[] _grid;

// number of triangles in grid horizontally and vertically
int _gridWidth;
int _gridHeight;

// size of triangles horizontally and vertically
float _horizontalSize;
float _verticalSize;

void setup() {
    size(/** int ( 0, 1024 ] **/ 640 /** endint **/, /** int ( 0, 1024 ] **/ 480 /** endint **/);
    noLoop();
    
    reset();
}

void reset() {
    _verticalSize   = TRIANGLE_SIZE / 2.0;
    _horizontalSize = sqrt(pow(TRIANGLE_SIZE, 2) - pow(_verticalSize, 2));
    
    _gridWidth  = ceil(width  / _horizontalSize);
    _gridHeight = ceil(height / _verticalSize) + 1;
    
    Triangle[] grid = new Triangle[_gridWidth * _gridHeight];
    
    // layout the initial grid
    for(int i = 0; i < grid.length; ++i) {
        int row = floor(i / _gridWidth);
        int col = i % _gridWidth;
        int odd = (row & 1) ^ (col & 1);
        
        float x = col * _horizontalSize;
        float y = row * _verticalSize;
        
        float x0, y0;
        float x1, y1;
        float x2, y2;
        
        // two cases depending on direction current triangle is "facing"
        if (odd == 1) {
            x0 = x;
            y0 = y;
            
            x1 = x + _horizontalSize;
            y1 = y - _verticalSize;
            
            x2 = x1;
            y2 = y + _verticalSize;
        } else {
            x0 = x;
            y0 = y - _verticalSize;
            
            x1 = x + _horizontalSize;
            y1 = y;
            
            x2 = x;
            y2 = y + _verticalSize;
        }
        
        grid[i] = new Triangle(new PVector(x0, y0), 
                               new PVector(x1, y1), 
                               new PVector(x2, y2));
    }
    
    _grid = grid;
}

void draw() {
    background(/** color **/ #ffffff /** endcolor **/);
    
    for (int i = 0; i < _grid.length; ++i) {
        _grid[i].draw();
    }
}

void mouseClicked() {
    // determine which triangle in the grid was clicked
    int col = floor(mouseX / _horizontalSize);
    int row = floor(mouseY / _verticalSize);
    
    Triangle active = _grid[row * _gridWidth + col];
    PVector pt = new PVector(mouseX, mouseY);
    
    // only two cases w.r.t. if you click below the triangle whose aabb 
    // corresponds to grid location at the given row and column; either 
    // the click point is in the triangle or it must be in the triangle 
    // directly below.
    if (!active.contains(pt)) {
        row += 1;
        active = _grid[row * _gridWidth + col];
    }
    
    // cycle the color of the clicked triangle and redraw
    active.cycleState();
    redraw();
}

// represents one triangle in the grid
class Triangle {
    final int BLANK_STATE = -1;
    
    PVector _p0;
    PVector _p1;
    PVector _p2;
     
    // current color state
    int _state;
    
    Triangle(PVector p0, PVector p1, PVector p2) {
        _p0 = p0;
        _p1 = p1;
        _p2 = p2;
        
        if (RANDOMIZE) {
            _state = ((int)random(0, COLOR_SCHEME.length + 1)) - 1;
        } else {
            _state = BLANK_STATE;
        }
    }
    
    void cycleState() {
        if (_state == BLANK_STATE) {
            _state = 0;
        } else if (++_state >= COLOR_SCHEME.length) {
            _state = BLANK_STATE;
        }
    }
    
    void contains(PVector pt) {
        boolean b0 = sign(pt, _p0, _p1) < 0.0;
        boolean b1 = sign(pt, _p1, _p2) < 0.0;
        boolean b2 = sign(pt, _p2, _p0) < 0.0;
        
        return (b0 == b1 && b1 == b2);
    }
    
    private float sign(PVector p0, PVector p1, PVector p2) {
        return (p0.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p2.y);
    }
    
    void draw() {
        if (_state == BLANK_STATE) {
            noFill();
            stroke(color(80, 80, 80, 18));
            strokeWeight(0.5);
        } else {
            color c = COLOR_SCHEME[_state];
            
            fill(c);
            
            // for colored triangles, we're adding a small stroke of the same color 
            // to make adjacent triangles overlap slightly in order to make them 
            // appear visually gapless. on the downside, this adds a very slight 
            // blur along the edge of two adjacent triangles of different color, 
            // but this is imho a small tradeoff compared to the non-subtle gaps 
            // that appear between same-colored adjacent triangles without this 
            // small amount of overlap.
            stroke(c);
            strokeWeight(1.0);
        }
        
        triangle(_p0.x, _p0.y, _p1.x, _p1.y, _p2.x, _p2.y);
    }
}

